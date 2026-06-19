import { createBooking, verifyPayment, getCustomerBookings, cancelBooking, getOwnerBookings, updateBookingStatus, createManualBooking, getBookingById, uploadOwnerVerificationDocuments, deleteBooking, checkAvailability } from '../services/booking.service.js';
import { createOrder as createRazorpayOrder, verifySignature } from '../services/payment.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import Booking from '../models/Booking.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { config } from '../config/env.js';
import cacheService from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

export const getOne = catchAsync(async (req, res) => {
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const booking = await getBookingById(req.params.id, userId);
  return ApiResponse.success(res, 200, 'Booking retrieved', { 
    booking,
    razorpayKeyId: config.payment.keyId
  });
});

export const create = catchAsync(async (req, res) => {
  const { carId, startDate, endDate, promoCode, notes, documents, signature, phone } = req.body;
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const result = await createBooking(userId, carId, startDate, endDate, promoCode, notes, documents, signature, phone);
  return ApiResponse.success(res, 201, 'Booking created', result);
});

export const createOrder = catchAsync(async (req, res) => {
  const {
    carId, pickupLocation, startDate, startTime, endDate, endTime,
    totalDays, totalPrice: basePrice, promoCode, documents, signature, phone,
  } = req.body;

  const lockKey = `booking:car:${carId}`;
  const locked = await cacheService.acquireLock(lockKey, 15000);
  if (!locked) {
    throw new AppError('This car is currently being booked by another user. Please try again in a few seconds.', 409);
  }

  try {
    await checkAvailability(carId, startDate, endDate);

    const userId = req.customer?._id || req.owner?._id || req.user?._id;
    const ADVANCE = 500;

    let finalTotalPrice = basePrice || 0;
    let appliedPromoCode = null;
    let discountAmount = 0;

    if (promoCode) {
      try {
        const promoRes = await import('../services/promo.service.js');
        const promoData = await promoRes.validatePromo(promoCode, finalTotalPrice);
        discountAmount = promoData.discountAmount || 0;
        appliedPromoCode = promoData.code;
        finalTotalPrice = Math.max(0, finalTotalPrice - discountAmount);
      } catch {}
    }

    const advanceAmount = ADVANCE;
    const balanceAmount = Math.max(0, finalTotalPrice - advanceAmount);
    const referenceId = `MD${Date.now().toString().slice(-8)}`;

    const razorpayOrder = await createRazorpayOrder(
      Math.round(advanceAmount * 100),
      'INR',
      referenceId
    );

    const booking = await Booking.create({
      car: carId,
      customer: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice: finalTotalPrice,
      promoCode: appliedPromoCode,
      discountAmount,
      status: BOOKING_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      referenceId: referenceId,
      razorpayOrderId: razorpayOrder.id,
      documents: documents || {},
      signature: signature || {},
      phone: phone || '',
      notes: '',
    });

    if (phone) {
      const Customer = (await import('../models/Customer.js')).default;
      await Customer.findByIdAndUpdate(userId, { phone });
    }

    return ApiResponse.success(res, 201, 'Order created', {
      bookingDetails: {
        _id: booking._id,
        referenceId: referenceId,
        totalPrice: finalTotalPrice,
        discountAmount,
        promoCode: appliedPromoCode,
        advancePaid: advanceAmount,
        balanceAmount,
      },
      razorpay: razorpayOrder && razorpayOrder.id
        ? { orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, keyId: razorpayOrder.key_id || '' }
        : null,
    });
  } finally {
    await cacheService.releaseLock(lockKey);
  }
});

export const verify = catchAsync(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = { ...req.query, ...req.body };
  const booking = await verifyPayment(bookingId || null, razorpayOrderId, razorpayPaymentId, razorpaySignature);
  return ApiResponse.success(res, 200, 'Payment verified', { booking });
});

export const forCustomer = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const result = await getCustomerBookings(userId, req.query, pagination);
  return ApiResponse.success(res, 200, 'Bookings retrieved', result.bookings, result.pagination);
});

export const cancel = catchAsync(async (req, res) => {
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const booking = await cancelBooking(req.params.id, userId);
  return ApiResponse.success(res, 200, 'Booking cancelled', { booking });
});

export const forOwner = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getOwnerBookings(req.ownerId, req.query, pagination);
  return ApiResponse.success(res, 200, 'Bookings retrieved', result.bookings, result.pagination);
});

export const updateStatus = catchAsync(async (req, res) => {
  const { status, cancellationReason, cancellationNote } = req.body;
  const booking = await updateBookingStatus(req.params.id, req.ownerId, status, cancellationReason, cancellationNote, req.user);
  return ApiResponse.success(res, 200, 'Booking status updated', { booking });
});

export const manual = catchAsync(async (req, res) => {
  const booking = await createManualBooking(req.ownerId, req.body.customer, req.body.booking, req.user);
  return ApiResponse.success(res, 201, 'Manual booking created', { booking });
});

export const createCashBooking = catchAsync(async (req, res) => {
  const { carId, pickupLocation, startDate, startTime, endDate, endTime, totalDays, totalPrice, promoCode, discountAmount, documents, signature, notes, phone } = req.body;

  const lockKey = `booking:car:${carId}`;
  const locked = await cacheService.acquireLock(lockKey, 15000);
  if (!locked) {
    throw new AppError('This car is currently being booked by another user. Please try again in a few seconds.', 409);
  }

  try {
    await checkAvailability(carId, startDate, endDate);

    const userId = req.customer?._id || req.owner?._id || req.user?._id;
    const Car = (await import('../models/Car.js')).default;
    const car = await Car.findById(carId);
    if (!car) throw new (await import('../utils/AppError.js')).AppError('Car not found', 404);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const calcDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const basePrice = car.pricePerDay * calcDays;
    const finalDiscount = discountAmount || 0;
    const finalTotalPrice = totalPrice || Math.max(0.01, basePrice - finalDiscount);
    const referenceId = `MD${Date.now().toString().slice(-8)}`;
    const booking = await Booking.create({
      car: carId,
      owner: car.owner,
      customer: userId,
      startDate: start,
      endDate: end,
      totalPrice: finalTotalPrice,
      promoCode: promoCode || null,
      discountAmount: finalDiscount,
      status: BOOKING_STATUS.CONFIRMED,
      paymentStatus: PAYMENT_STATUS.PAY_AT_CAR,
      referenceId: referenceId,
      razorpayOrderId: undefined,
      documents: documents || {},
      signature: signature || {},
      notes: notes || '',
      phone: phone || '',
      securityDeposit: 500,
      amountPaid: 0,
    });

    try {
      const { assignInvoiceToBooking } = await import('../services/invoice.service.js');
      await assignInvoiceToBooking(booking);
    } catch (err) {
      console.error('Invoice generation failed:', err.message);
    }

    if (phone) {
      const Customer = (await import('../models/Customer.js')).default;
      await Customer.findByIdAndUpdate(userId, { phone });
    }

    const { getIO } = await import('../config/socket.js');
    const { SOCKET_EVENTS } = await import('../config/socket.events.js');
    try { getIO().to(`owner:${car.owner}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking); } catch {}
    const { createNotification } = await import('../services/notification.service.js');
    try { await createNotification(car.owner, 'Owner', 'new_booking', 'New Cash Booking', `A pay-at-car booking for ${car.make} ${car.model}`, `/owner/bookings/${booking._id}`); } catch {}
    return ApiResponse.success(res, 201, 'Cash booking created', {
      bookingDetails: { _id: booking._id, referenceId, totalPrice: finalTotalPrice, promoCode, discountAmount: finalDiscount, paymentStatus: PAYMENT_STATUS.PAY_AT_CAR }
    });
  } finally {
    await cacheService.releaseLock(lockKey);
  }
});

export const uploadOwnerDocuments = catchAsync(async (req, res) => {
  const { documents } = req.body;
  if (!documents || !Array.isArray(documents)) {
    return ApiResponse.error(res, 400, 'Documents are required as an array of base64 strings');
  }
  const booking = await uploadOwnerVerificationDocuments(req.params.id, req.ownerId, documents);
  return ApiResponse.success(res, 200, 'Documents uploaded successfully', { booking });
});

export const remove = catchAsync(async (req, res) => {
  const booking = await deleteBooking(req.params.id, req.ownerId);
  return ApiResponse.success(res, 200, 'Booking deleted successfully', { booking });
});

export const searchCustomer = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return ApiResponse.success(res, 200, 'Customers retrieved', []);
  }

  // Helper: escape regex special characters to prevent MongoDB regex crash
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const Customer = (await import('../models/Customer.js')).default;

  const safeQ = escapeRegex(q.trim());
  const conditions = [
    { name: { $regex: safeQ, $options: 'i' } }
  ];

  // Clean query for numeric digits
  const cleanPhone = q.replace(/\D/g, '');
  if (cleanPhone.length >= 3) {
    const safePhone = escapeRegex(cleanPhone);
    conditions.push({ phone: { $regex: safePhone, $options: 'i' } });

    // If it's a 10-digit number or longer, also search by the last 10 digits
    if (cleanPhone.length >= 10) {
      const last10 = cleanPhone.slice(-10);
      if (last10 !== cleanPhone) {
        conditions.push({ phone: { $regex: escapeRegex(last10), $options: 'i' } });
      }
    }
  }

  const customers = await Customer.find({
    $or: conditions
  })
    .select('-password')
    .limit(10)
    .lean();

  return ApiResponse.success(res, 200, 'Customers retrieved', customers);
});