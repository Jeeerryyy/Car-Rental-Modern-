import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Promo from '../models/Promo.js';
import { AppError } from '../utils/AppError.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { createOrder, verifySignature } from './payment.service.js';
import { createNotification } from './notification.service.js';
import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../config/socket.events.js';
import { uploadImage } from './cloudinary.service.js';
import { CLOUDINARY_FOLDERS } from '../utils/constants.js';
import { assignInvoiceToBooking } from './invoice.service.js';
import { config } from '../config/env.js';
import cacheService from '../config/redis.js';

const invalidateBookingCache = async (carId = null) => {
  try {
    await Promise.all([
      cacheService.delPattern('cars:*'),
      cacheService.delPattern('owner:dashboard-stats:*')
    ]);
    try {
      getIO().to('public').emit(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, { carId });
    } catch {
      // Socket might not be active in some test contexts
    }
  } catch (err) {
    console.error('[Cache] Targeted invalidation failed on booking mutation:', err);
  }
};

export const checkAvailability = async (carId, startDate, endDate) => {
  const car = await Car.findById(carId);
  if (!car || car.isDeleted || !car.isActive) {
    throw new AppError('Car not available', 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

  const conflictingBookings = await Booking.findOne({
    car: carId,
    startDate: { $lt: end },
    endDate: { $gt: start },
    $or: [
      { status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] } },
      { 
        status: BOOKING_STATUS.PENDING,
        createdAt: { $gte: tenMinutesAgo }
      }
    ]
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
  const lockKey = `booking:car:${carId}`;
  const locked = await cacheService.acquireLock(lockKey, 15000);
  if (!locked) {
    throw new AppError('This car is currently being booked by another user. Please try again in a few seconds.', 409);
  }

  try {
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

    const confirmationAmount = Math.min(500, totalPrice);

    const razorpayOrder = await createOrder(
      Math.round(confirmationAmount * 100),
      'INR',
      `rec_${Date.now().toString().slice(-8)}`
    );

    const booking = await Booking.create({
      car: carId,
      owner: car.owner,
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
      securityDeposit: confirmationAmount,
      amountPaid: 0,
      status: BOOKING_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      razorpayOrderId: razorpayOrder.id
    });

    if (phone) {
      const Customer = (await import('../models/Customer.js')).default;
      await Customer.findByIdAndUpdate(customerId, { phone });
    }

    await Car.findByIdAndUpdate(carId, { $inc: { totalBookings: 1 } });

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

    invalidateBookingCache();
    return {
      booking,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.payment.keyId
    };
  } finally {
    await cacheService.releaseLock(lockKey);
  }
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

  if (config.payment.enabled) {
    const isValid = verifySignature(booking.razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new AppError('Payment verification failed: invalid signature', 400);
    }
  }

  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.PAID;
  booking.razorpayPaymentId = razorpayPaymentId;
  // Online bookings: charge flat ₹500 or the lower total price as deposit/advance paid
  const paidAmount = Math.min(500, booking.totalPrice);
  booking.securityDeposit = paidAmount;
  booking.amountPaid = paidAmount;
  await booking.save();

  // Auto-generate invoice on confirmation
  try {
    await assignInvoiceToBooking(booking);
  } catch (err) {
    console.error('Invoice generation failed:', err.message);
  }

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

  invalidateBookingCache();
  return booking;
};

export const getCustomerBookings = async (customerId, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const query = { customer: customerId };

  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $ne: BOOKING_STATUS.PENDING };
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

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  } else if (!filters.status && !filters.search && !filters.q) {
    query.status = { $ne: BOOKING_STATUS.PENDING };
  }

  if (filters.startDate || filters.endDate) {
    query.startDate = {};
    if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
  }

  const searchQuery = (filters.search || filters.q || '').trim();
  if (searchQuery) {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeSearch = escapeRegex(searchQuery);
    const cleanDigits = searchQuery.replace(/\D/g, '');

    const CustomerModel = (await import('../models/Customer.js')).default;
    const CarModel = (await import('../models/Car.js')).default;

    const customerConditions = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } }
    ];
    if (cleanDigits.length >= 3) {
      customerConditions.push({ phone: { $regex: cleanDigits, $options: 'i' } });
      if (cleanDigits.length >= 10) {
        customerConditions.push({ phone: { $regex: cleanDigits.slice(-10), $options: 'i' } });
      }
    }

    const matchedCustomerIds = await CustomerModel.find({ $or: customerConditions }).distinct('_id');

    const matchedCarIds = await CarModel.find({
      owner: ownerId,
      $or: [
        { make: { $regex: safeSearch, $options: 'i' } },
        { model: { $regex: safeSearch, $options: 'i' } },
        { registrationNumber: { $regex: safeSearch, $options: 'i' } }
      ]
    }).distinct('_id');

    const orConditions = [
      { referenceId: { $regex: safeSearch, $options: 'i' } }
    ];
    if (matchedCustomerIds.length > 0) {
      orConditions.push({ customer: { $in: matchedCustomerIds } });
    }
    if (matchedCarIds.length > 0) {
      orConditions.push({ car: { $in: matchedCarIds } });
    }
    if (cleanDigits.length >= 3) {
      orConditions.push({ phone: { $regex: cleanDigits, $options: 'i' } });
      if (cleanDigits.length >= 10) {
        orConditions.push({ phone: { $regex: cleanDigits.slice(-10), $options: 'i' } });
      }
    }

    query.$or = orConditions;
  }

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('car', 'make model images registrationNumber pricePerDay')
    .populate('customer', 'name email phone address drivingLicenceNumber aadhaarNumber')
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

export const updateBookingStatus = async (bookingId, ownerId, newStatus, cancellationReason = null, cancellationNote = null, actingUser = null) => {
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
  
  // If acting user is staff, notify the owner
  if (actingUser && actingUser.role === 'staff') {
    await createNotification(
      ownerId,
      'Owner',
      'general',
      'Staff Action: Booking Updated',
      `Staff member ${actingUser.name} updated booking ${booking.referenceId || booking._id} status to ${newStatus}`,
      `/owner/bookings/${booking._id}`
    );
  }

  invalidateBookingCache();
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

  invalidateBookingCache();
  return booking;
};

export const createManualBooking = async (ownerId, customerData, bookingData, actingUser = null) => {
  const lockKey = `booking:car:${bookingData.carId}`;
  const locked = await cacheService.acquireLock(lockKey, 15000);
  if (!locked) {
    throw new AppError('This car is currently being booked. Please try again in a few seconds.', 409);
  }

  try {
  const car = await Car.findOne({ _id: bookingData.carId, owner: ownerId });
  if (!car) {
    throw new AppError('Car not found', 404);
  }

  await checkAvailability(bookingData.carId, bookingData.startDate, bookingData.endDate);

  let customer;
  let email = customerData.email;
  const cleanPhone = customerData.phone ? String(customerData.phone).replace(/\D/g, '') : '';
  const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

  const CustomerModel = (await import('../models/Customer.js')).default;

  // 1. Check if customer exists by phone
  if (last10) {
    customer = await CustomerModel.findOne({
      $or: [
        { phone: last10 },
        { phone: `+91${last10}` },
        { phone: { $regex: last10, $options: 'i' } }
      ]
    });
  }

  // 2. If not found by phone, check by email if provided
  if (!customer && email) {
    customer = await CustomerModel.findOne({ email });
  }

  // 3. If still no customer and no email provided, generate placeholder email
  if (!customer && !email) {
    const randomId = Math.random().toString(36).substring(2, 8);
    const identifier = last10 || randomId;
    email = `walkin_${identifier}_${randomId}@modern-selfdrive.local`;
  }

  if (!customer) {
    customer = await CustomerModel.create({
      ...customerData,
      phone: last10 || customerData.phone,
      email,
      password: 'ChangeMe@123'
    });
  } else {
    let changed = false;
    if (customerData.name && customer.name !== customerData.name) {
      customer.name = customerData.name;
      changed = true;
    }
    if (last10 && (!customer.phone || customer.phone !== last10)) {
      customer.phone = last10;
      changed = true;
    }
    if (customerData.email && (!customer.email || customer.email.includes('@modern-selfdrive.local'))) {
      customer.email = customerData.email;
      changed = true;
    }
    if (customerData.address) {
      customer.address = customerData.address;
      changed = true;
    }
    if (customerData.drivingLicenceNumber) {
      customer.drivingLicenceNumber = customerData.drivingLicenceNumber;
      changed = true;
    }
    if (customerData.aadhaarNumber) {
      customer.aadhaarNumber = customerData.aadhaarNumber;
      changed = true;
    }
    if (changed) {
      await customer.save();
    }
  }

  const start = new Date(bookingData.startDate);
  const end = new Date(bookingData.endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = car.pricePerDay * totalDays;

  const securityDeposit = Number(bookingData.securityDeposit) || 0;
  const amountPaid = Number(bookingData.amountPaid) || 0;

  // Upload base64 KYC documents to Cloudinary if provided
  const documents = {
    aadhaar: { front: null, back: null },
    license: { front: null, back: null }
  };

  if (bookingData.documents) {
    const uploadBase64 = async (base64Str) => {
      if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) return null;
      try {
        const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const { uploadDocument } = await import('./cloudinary.service.js');
        return await uploadDocument(buffer);
      } catch (err) {
        console.error('Manual booking KYC upload failed:', err);
        return null;
      }
    };

    if (bookingData.documents.aadhaar?.front) {
      documents.aadhaar.front = await uploadBase64(bookingData.documents.aadhaar.front);
    }
    if (bookingData.documents.aadhaar?.back) {
      documents.aadhaar.back = await uploadBase64(bookingData.documents.aadhaar.back);
    }
    if (bookingData.documents.license?.front) {
      documents.license.front = await uploadBase64(bookingData.documents.license.front);
    }
    if (bookingData.documents.license?.back) {
      documents.license.back = await uploadBase64(bookingData.documents.license.back);
    }
  }

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
    phone: last10 || customerData.phone || customer.phone || '',
    securityDeposit,
    amountPaid,
    documents
  });

  // Auto-generate invoice for manual bookings (created as confirmed)
  if (booking.status === 'confirmed') {
    try {
      await assignInvoiceToBooking(booking);
    } catch (err) {
      console.error('Invoice generation failed:', err.message);
    }
  }

  await Car.findByIdAndUpdate(car._id, { $inc: { totalBookings: 1 } });

  // Real-time socket emission for manual bookings
  try {
    getIO().to(`owner:${ownerId}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking);
  } catch (err) {
    console.error('Socket emission failed', err);
  }

  // If acting user is staff, notify the owner
  if (actingUser && actingUser.role === 'staff') {
    await createNotification(
      ownerId,
      'Owner',
      'new_booking',
      'Staff Action: New Booking Created',
      `Staff member ${actingUser.name} created a manual booking for ${car.make} ${car.model}`,
      `/owner/bookings/${booking._id}`
    );
  }

  invalidateBookingCache(bookingData.carId);
  return booking;
  } finally {
    await cacheService.releaseLock(lockKey);
  }
};
export const getBookingById = async (bookingId, userId, ownerId = null) => {
  const orConditions = [{ customer: userId }, { owner: userId }];
  if (ownerId && ownerId.toString() !== userId?.toString()) {
    orConditions.push({ owner: ownerId });
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: orConditions
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

  invalidateBookingCache();
  return booking;
};

export const deleteBooking = async (bookingId, ownerId) => {
  const booking = await Booking.findOneAndDelete({ _id: bookingId, owner: ownerId });
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  invalidateBookingCache();
  return booking;
};

