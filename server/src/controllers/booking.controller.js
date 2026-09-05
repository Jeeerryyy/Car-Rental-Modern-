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
  const ownerId = req.ownerId || req.owner?._id;
  const booking = await getBookingById(req.params.id, userId, ownerId);
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
    try { 
      getIO().to(`owner:${car.owner}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking); 
      getIO().to('public').emit(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, { carId });
      await cacheService.delPattern('cars:*');
    } catch {}
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
  const Booking = (await import('../models/Booking.js')).default;

  const cleanQ = q.trim();
  const safeQ = escapeRegex(cleanQ);

  const conditions = [
    { name: { $regex: safeQ, $options: 'i' } },
    { email: { $regex: safeQ, $options: 'i' } },
    { drivingLicenceNumber: { $regex: safeQ, $options: 'i' } },
    { aadhaarNumber: { $regex: safeQ, $options: 'i' } }
  ];

  // Clean query for numeric digits
  const digits = cleanQ.replace(/\D/g, '');
  if (digits.length >= 3) {
    // Allows flexible matching when spaces or dashes are stored in DB (e.g. "98765 43210")
    const digitPattern = digits.split('').join('[\\s\\-\\.]*');
    conditions.push({ phone: { $regex: digitPattern, $options: 'i' } });

    // Handle country code prefix (e.g. +91 entered by user)
    if (digits.startsWith('91') && digits.length > 4) {
      const without91 = digits.slice(2);
      conditions.push({ phone: { $regex: without91.split('').join('[\\s\\-\\.]*'), $options: 'i' } });
    }

    // Handle last 10 digits
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      conditions.push({ phone: { $regex: last10.split('').join('[\\s\\-\\.]*'), $options: 'i' } });
    }
  }

  // 1. Search in Customer collection
  const rawCustomers = await Customer.find({ $or: conditions })
    .select('-password')
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();

  // 2. Also search past bookings in case phone/customer is in Bookings
  if (digits.length >= 3) {
    const bookingConditions = [
      { phone: { $regex: digits.split('').join('[\\s\\-\\.]*'), $options: 'i' } }
    ];
    if (digits.length >= 10) {
      bookingConditions.push({ phone: { $regex: digits.slice(-10).split('').join('[\\s\\-\\.]*'), $options: 'i' } });
    }

    const pastBookings = await Booking.find({ $or: bookingConditions })
      .populate('customer', '-password')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    for (const b of pastBookings) {
      if (b.customer && typeof b.customer === 'object') {
        rawCustomers.push(b.customer);
      }
    }
  }

  // 3. Deduplicate customers by normalized phone number or email or ID
  const map = new Map();
  for (const cust of rawCustomers) {
    const cleanPhone = cust.phone ? cust.phone.replace(/\D/g, '').slice(-10) : '';
    const key = cleanPhone || (cust.email && !cust.email.includes('@modern-selfdrive.local') ? cust.email : cust._id.toString());

    if (!map.has(key)) {
      map.set(key, { ...cust });
    } else {
      const existing = map.get(key);
      if (!existing.address && cust.address) existing.address = cust.address;
      if (!existing.drivingLicenceNumber && cust.drivingLicenceNumber) existing.drivingLicenceNumber = cust.drivingLicenceNumber;
      if (!existing.aadhaarNumber && cust.aadhaarNumber) existing.aadhaarNumber = cust.aadhaarNumber;
      if (existing.email?.includes('@modern-selfdrive.local') && cust.email && !cust.email.includes('@modern-selfdrive.local')) {
        existing.email = cust.email;
      }
      if ((!existing.phone || existing.phone === 'Not provided') && cust.phone && cust.phone !== 'Not provided') {
        existing.phone = cust.phone;
      }
    }
  }

  const deduplicated = Array.from(map.values()).slice(0, 10);

  // 4. Enrich each customer with real past booking count & last booking date via batch aggregation
  const customerIds = deduplicated.map(c => c._id);
  const allPhones = [];
  for (const c of deduplicated) {
    const clean = c.phone ? c.phone.replace(/\D/g, '').slice(-10) : '';
    if (clean && clean.length === 10) {
      allPhones.push(clean, `+91${clean}`);
    }
  }

  try {
    const stats = await Booking.aggregate([
      {
        $match: {
          $or: [
            { customer: { $in: customerIds } },
            ...(allPhones.length > 0 ? [{ phone: { $in: allPhones } }] : [])
          ]
        }
      },
      {
        $project: {
          customer: 1,
          phone: 1,
          date: { $ifNull: ['$startDate', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: {
            $ifNull: [
              '$customer',
              '$phone'
            ]
          },
          count: { $sum: 1 },
          lastBookingDate: { $max: '$date' }
        }
      }
    ]);

    const statsMap = new Map();
    for (const item of stats) {
      if (item._id) statsMap.set(item._id.toString(), item);
    }

    for (const cust of deduplicated) {
      const idStr = cust._id?.toString();
      const cleanPhone = cust.phone ? cust.phone.replace(/\D/g, '').slice(-10) : '';
      const byId = idStr ? statsMap.get(idStr) : null;
      const byPhone = cleanPhone ? (statsMap.get(cleanPhone) || statsMap.get(`+91${cleanPhone}`)) : null;
      
      const count = Math.max(byId?.count || 0, byPhone?.count || 0);
      const lastDate = byId?.lastBookingDate || byPhone?.lastBookingDate || null;
      
      cust.pastBookingsCount = count;
      cust.lastBookingDate = lastDate;
    }
  } catch (err) {
    for (const cust of deduplicated) {
      cust.pastBookingsCount = 0;
      cust.lastBookingDate = null;
    }
  }

  // Sort by past bookings count (descending) and updated timestamp
  deduplicated.sort((a, b) => (b.pastBookingsCount || 0) - (a.pastBookingsCount || 0));

  return ApiResponse.success(res, 200, 'Customers retrieved', deduplicated);
});

export const lookupCustomerByPhone = catchAsync(async (req, res) => {
  const { phone } = req.query;
  if (!phone || typeof phone !== 'string') {
    return ApiResponse.success(res, 200, 'Customer lookup result', { found: false, customer: null });
  }

  const cleanDigits = phone.replace(/\D/g, '');
  const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

  if (last10.length < 10) {
    return ApiResponse.success(res, 200, 'Customer lookup result', { found: false, customer: null });
  }

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safe10 = escapeRegex(last10);

  const Customer = (await import('../models/Customer.js')).default;
  const Booking = (await import('../models/Booking.js')).default;

  // 1. Try finding in Customer collection
  let customer = await Customer.findOne({
    $or: [
      { phone: last10 },
      { phone: `+91${last10}` },
      { phone: { $regex: safe10, $options: 'i' } }
    ]
  })
    .select('-password')
    .lean();

  // 2. If not found in Customer, check previous bookings of this owner
  if (!customer && req.ownerId) {
    const pastBooking = await Booking.findOne({
      owner: req.ownerId,
      $or: [
        { phone: last10 },
        { phone: `+91${last10}` },
        { phone: { $regex: safe10, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('customer', '-password')
      .lean();

    if (pastBooking && pastBooking.customer) {
      customer = pastBooking.customer;
    }
  }

  if (!customer) {
    return ApiResponse.success(res, 200, 'Customer lookup result', { found: false, customer: null });
  }

  // Count past bookings with this owner
  let pastBookingsCount = 0;
  let lastBookingDate = null;
  if (req.ownerId) {
    pastBookingsCount = await Booking.countDocuments({
      owner: req.ownerId,
      $or: [
        { customer: customer._id },
        { phone: last10 }
      ]
    });

    const lastBooking = await Booking.findOne({
      owner: req.ownerId,
      $or: [
        { customer: customer._id },
        { phone: last10 }
      ]
    })
      .sort({ createdAt: -1 })
      .select('createdAt startDate')
      .lean();

    if (lastBooking) {
      lastBookingDate = lastBooking.startDate || lastBooking.createdAt;
    }
  }

  return ApiResponse.success(res, 200, 'Customer lookup result', {
    found: true,
    customer,
    pastBookingsCount,
    lastBookingDate
  });
});