import { createBooking, verifyPayment, getCustomerBookings, cancelBooking, getOwnerBookings, updateBookingStatus, createManualBooking, getBookingById } from '../services/booking.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getOne = catchAsync(async (req, res) => {
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const booking = await getBookingById(req.params.id, userId);
  return ApiResponse.success(res, 200, 'Booking retrieved', { booking });
});

export const create = catchAsync(async (req, res) => {
  const { carId, startDate, endDate, promoCode, notes, documents, signature } = req.body;
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const result = await createBooking(userId, carId, startDate, endDate, promoCode, notes, documents, signature);
  return ApiResponse.success(res, 201, 'Booking created', result);
});

export const verify = catchAsync(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const booking = await verifyPayment(bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature);
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
  const result = await getOwnerBookings(req.owner._id, req.query, pagination);
  return ApiResponse.success(res, 200, 'Bookings retrieved', result.bookings, result.pagination);
});

export const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const booking = await updateBookingStatus(req.params.id, req.owner._id, status);
  return ApiResponse.success(res, 200, 'Booking status updated', { booking });
});

export const manual = catchAsync(async (req, res) => {
  const booking = await createManualBooking(req.owner._id, req.body.customer, req.body.booking);
  return ApiResponse.success(res, 201, 'Manual booking created', { booking });
});
