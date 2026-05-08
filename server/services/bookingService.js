const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Razorpay = require('razorpay');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const checkOverlap = async (carId, startDate, endDate) => {
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  return !!overlappingBooking;
};

const createBooking = async (data) => {
  const { carId, customerId, startDate, endDate, notes } = data;

  // 1. Verify Car
  const car = await Car.findById(carId);
  if (!car) throw new AppError('Car not found', 404);
  if (car.status !== 'Available') throw new AppError('Car is not currently available', 400);

  // 2. Check Overlap
  const isOverlapping = await checkOverlap(carId, startDate, endDate);
  if (isOverlapping) throw new AppError('Car is already booked for these dates', 400);

  // 3. Calculate Price
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const totalDays = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24));
  if (totalDays < 1) throw new AppError('Booking must be at least 1 day', 400);

  const totalPrice = (totalDays * car.pricePerDay) + car.securityDeposit;

  // 4. Create Pending Booking
  const booking = await Booking.create({
    car: carId,
    customer: customerId,
    startDate,
    endDate,
    totalPrice,
    notes,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // 5. Generate Razorpay Order
  let razorpayOrder;
  if (process.env.RAZORPAY_KEY_ID) {
    razorpayOrder = await razorpay.orders.create({
      amount: totalPrice * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${booking._id}`
    });
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();
  }

  return { booking, razorpayOrder, car };
};

const verifyPayment = async (bookingId, razorpayPaymentId, razorpaySignature) => {
  // Mock verification for now until keys are active
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.razorpayPaymentId = razorpayPaymentId;
  await booking.save();

  // Increment car bookings
  await Car.findByIdAndUpdate(booking.car, { $inc: { totalBookings: 1 } });

  return booking;
};

const getAllBookings = async () => {
  return await Booking.find()
    .sort('-createdAt')
    .populate('customer', 'name email phone')
    .populate('car', 'make model licensePlate pricePerDay images');
};

module.exports = {
  checkOverlap,
  createBooking,
  verifyPayment,
  getAllBookings
};
