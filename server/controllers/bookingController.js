const bookingService = require('../services/bookingService');
const catchAsync = require('../utils/catchAsync');

exports.createBooking = catchAsync(async (req, res, next) => {
  const customerId = req.user._id; // Assumes protect middleware
  const { carId, startDate, endDate, notes } = req.body;

  const result = await bookingService.createBooking({
    carId,
    customerId,
    startDate,
    endDate,
    notes
  });

  res.status(201).json({
    success: true,
    data: result
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { bookingId, razorpayPaymentId, razorpaySignature } = req.body;

  const booking = await bookingService.verifyPayment(bookingId, razorpayPaymentId, razorpaySignature);

  res.status(200).json({
    success: true,
    data: {
      booking
    }
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await bookingService.getAllBookings();
  
  res.status(200).json({
    success: true,
    data: {
      bookings
    }
  });
});
