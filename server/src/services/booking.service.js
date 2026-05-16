import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Promo from '../models/Promo.js';
import { AppError } from '../utils/AppError.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { createOrder } from './payment.service.js';
import { createNotification } from './notification.service.js';
import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../config/socket.events.js';
import { uploadImage } from './cloudinary.service.js';
import { CLOUDINARY_FOLDERS } from '../utils/constants.js';

export const checkAvailability = async (carId, startDate, endDate) => {
  const car = await Car.findById(carId);
  if (!car || car.isDeleted || !car.isActive) {
    throw new AppError('Car not available', 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const conflictingBookings = await Booking.findOne({
    car: carId,
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    startDate: { $lt: end },
    endDate: { $gt: start }
  });

  if (conflictingBookings) {
    throw new AppError('Car is not available for the selected dates', 400);
  }

  const unavailableOverlap = car.unavailableDates?.some(block => {
    const blockStart = new Date(block.startDate);
    const blockEnd = new Date(block.endDate);
    return blockStart < end && blockEnd > start;
  });

  if (unavailableOverlap) {
    throw new AppError('Car is blocked for the selected dates', 400);
  }

  return true;
};

export const createBooking = async (customerId, carId, startDate, endDate, promoCode = null, notes = '', documents = {}, signature = {}, phone = '') => {
  await checkAvailability(carId, startDate, endDate);

  const car = await Car.findById(carId);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  let totalPrice = car.pricePerDay * totalDays;
  let discountAmount = 0;
  let appliedPromoCode = null;

  if (promoCode) {
    const promo = await Promo.findOne({ code: promoCode.toUpperCase() });
    if (promo && promo.isActive && promo.usedCount < promo.maxUses && new Date(promo.expiresAt) > new Date()) {
      if (totalPrice >= promo.minOrderValue) {
        appliedPromoCode = promo.code;
        if (promo.discountType === 'percentage') {
          discountAmount = (totalPrice * promo.discountValue) / 100;
        } else {
          discountAmount = promo.discountValue;
        }
        totalPrice = totalPrice - discountAmount;
      }
    }
  }

  const razorpayOrder = await createOrder(
    Math.round(totalPrice * 100),
    'INR',
    `booking_${customerId}_${Date.now()}`
  );

  const booking = await Booking.create({
    car: carId,
    owner: car.owner, // Denormalized owner
    customer: customerId,
    startDate,
    endDate,
    totalPrice,
    promoCode: appliedPromoCode,
    discountAmount,
    notes,
    documents,
    signature,
    phone,
    status: BOOKING_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.PENDING,
    razorpayOrderId: razorpayOrder.id
  });

  // Sync phone with customer profile if provided
  if (phone) {
    const Customer = (await import('../models/Customer.js')).default;
    await Customer.findByIdAndUpdate(customerId, { phone });
  }

  await Car.findByIdAndUpdate(carId, { $inc: { totalBookings: 1 } });

  // Real-time socket emission
  try {
    getIO().to(`owner:${car.owner}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking);
  } catch (err) {
    console.error('Socket emission failed', err);
  }

  await createNotification(
    car.owner,
    'Owner',
    'new_booking',
    'New Booking Received',
    `A new booking has been placed for ${car.make} ${car.model}`,
    `/owner/bookings/${booking._id}`
  );

  return {
    booking,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  };
};

export const verifyPayment = async (bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  let booking;
  if (bookingId) {
    booking = await Booking.findById(bookingId);
  } else if (razorpayOrderId) {
    booking = await Booking.findOne({ razorpayOrderId });
  }
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.PAID;
  booking.razorpayPaymentId = razorpayPaymentId;
  await booking.save();

  if (booking.promoCode) {
    await Promo.findOneAndUpdate(
      { code: booking.promoCode },
      { $inc: { usedCount: 1 } }
    );
  }

  try {
    getIO().to(`owner:${booking.owner}`).emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);
    getIO().to(`user:${booking.customer}`).emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);
  } catch (err) {}

  await createNotification(
    booking.customer,
    'Customer',
    'booking_confirmed',
    'Booking Confirmed',
    `Your booking for ${new Date(booking.startDate).toLocaleDateString()} has been confirmed`,
    `/bookings/${booking._id}`
  );

  return booking;
};

export const getCustomerBookings = async (customerId, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const query = { customer: customerId };

  if (filters.status) {
    query.status = filters.status;
  }

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('car', 'make model images pricePerDay category fuelType transmission year registrationNumber')
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    bookings,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const getOwnerBookings = async (ownerId, filters = {}, pagination = { page: 1, limit: 10 }) => {
  // Using denormalized owner field for performance
  const query = { owner: ownerId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    query.startDate = {};
    if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
  }

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('car', 'make model images')
    .populate('customer', 'name email phone')
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    bookings,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const updateBookingStatus = async (bookingId, ownerId, newStatus, cancellationReason = null, cancellationNote = null) => {
  const booking = await Booking.findOne({ _id: bookingId, owner: ownerId });
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const validTransitions = {
    [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.ACTIVE]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED]
  };

  if (!validTransitions[booking.status]?.includes(newStatus)) {
    throw new AppError(`Cannot transition from ${booking.status} to ${newStatus}`, 400);
  }

  booking.status = newStatus;

  // If owner is cancelling, store the reason
  if (newStatus === BOOKING_STATUS.CANCELLED) {
    booking.cancelledBy = 'owner';
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    if (cancellationNote) booking.cancellationNote = cancellationNote;
  }

  await booking.save();

  try {
    getIO().to(`user:${booking.customer}`).emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);
    getIO().to(`owner:${booking.owner}`).emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);
  } catch (err) {}

  const notificationType = newStatus === BOOKING_STATUS.COMPLETED ? 'booking_completed' :
    newStatus === BOOKING_STATUS.CANCELLED ? 'booking_cancelled' : 'general';

  const REASON_LABELS = {
    invalid_documents: 'Invalid Documents',
    vehicle_not_available: 'Vehicle Not Available',
    customer_no_show: 'Customer No-Show',
    payment_issue: 'Payment Issue',
    other: 'Other'
  };

  const notificationMessage = newStatus === BOOKING_STATUS.CANCELLED && cancellationReason
    ? `Your booking has been cancelled by the owner. Reason: ${REASON_LABELS[cancellationReason] || cancellationReason}`
    : `Your booking status has been updated to ${newStatus}`;

  await createNotification(
    booking.customer,
    'Customer',
    notificationType,
    `Booking ${newStatus}`,
    notificationMessage,
    `/bookings/${booking._id}`
  );

  return booking;
};

export const cancelBooking = async (bookingId, customerId) => {
  const booking = await Booking.findOne({ _id: bookingId, customer: customerId });
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    throw new AppError('Cannot cancel this booking', 400);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledBy = 'customer';
  await booking.save();

  try {
    getIO().to(`owner:${booking.owner}`).emit(SOCKET_EVENTS.BOOKING_CANCELLED, booking);
    getIO().to(`user:${booking.customer}`).emit(SOCKET_EVENTS.BOOKING_CANCELLED, booking);
  } catch (err) {}

  await createNotification(
    booking.owner,
    'Owner',
    'booking_cancelled',
    'Booking Cancelled',
    `Booking has been cancelled by the customer`,
    `/owner/bookings/${booking._id}`
  );

  return booking;
};

export const createManualBooking = async (ownerId, customerData, bookingData) => {
  const car = await Car.findOne({ _id: bookingData.carId, owner: ownerId });
  if (!car) {
    throw new AppError('Car not found', 404);
  }

  // Ensure dates are valid and car is available
  await checkAvailability(bookingData.carId, bookingData.startDate, bookingData.endDate);

  let customer;
  let email = customerData.email;

  // If no email provided, generate a unique placeholder
  if (!email) {
    const randomId = Math.random().toString(36).substring(2, 8);
    const identifier = customerData.phone ? customerData.phone.replace(/\+/g, '') : randomId;
    email = `walkin_${identifier}_${randomId}@modern-selfdrive.local`;
  }

  const CustomerModel = (await import('../models/Customer.js')).default;
  customer = await CustomerModel.findOne({ email });

  if (!customer) {
    customer = await CustomerModel.create({
      ...customerData,
      email,
      password: 'ChangeMe@123'
    });
  } else if (customerData.phone && !customer.phone) {
    // Update phone if missing on existing customer
    customer.phone = customerData.phone;
    await customer.save();
  }

  const start = new Date(bookingData.startDate);
  const end = new Date(bookingData.endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = car.pricePerDay * totalDays;

  const booking = await Booking.create({
    car: bookingData.carId,
    owner: ownerId,
    customer: customer._id,
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    totalPrice,
    status: bookingData.status || 'confirmed',
    paymentStatus: bookingData.paymentStatus || 'paid',
    notes: bookingData.notes,
    phone: customerData.phone || ''
  });

  await Car.findByIdAndUpdate(car._id, { $inc: { totalBookings: 1 } });

  // Real-time socket emission for manual bookings
  try {
    getIO().to(`owner:${ownerId}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking);
  } catch (err) {
    console.error('Socket emission failed', err);
  }

  return booking;
};
export const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ customer: userId }, { owner: userId }]
  })
    .populate('car', 'make model images pricePerDay category fuelType transmission seats year registrationNumber')
    .populate('customer', 'name email phone');

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return booking;
};

export const uploadOwnerVerificationDocuments = async (bookingId, ownerId, documentBase64s) => {
  const booking = await Booking.findOne({ _id: bookingId, owner: ownerId })
    .populate('car', 'make model images registrationNumber')
    .populate('customer', 'name email phone');
    
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const uploadedDocs = [];
  for (const base64Data of documentBase64s) {
    if (base64Data && base64Data.startsWith('data:')) {
      const cleanBase64 = base64Data.replace(/^data:[^,]+,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uniqueId = `${bookingId}_owner_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const result = await uploadImage(buffer, CLOUDINARY_FOLDERS.OWNER_VERIFIED_DOCUMENTS, uniqueId);
      uploadedDocs.push(result);
    }
  }

  if (uploadedDocs.length > 0) {
    if (!booking.ownerVerification) {
      booking.ownerVerification = { documents: [] };
    }
    booking.ownerVerification.documents.push(...uploadedDocs);
    await booking.save();
  }

  return booking;
};
