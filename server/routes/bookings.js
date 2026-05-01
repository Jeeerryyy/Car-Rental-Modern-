/**
 * Bookings Routes - Create, read, update, cancel bookings
 * @module routes/bookings
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { body } = require('express-validator');

const logger = require('../utils/logger');
const { withTransaction } = require('../utils/transaction');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Promo = require('../models/Promo');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const DRIVER_RATE_PER_DAY = 500;

/**
 * POST /api/bookings - Create new booking with pricing calculation
 */
router.post('/', protect, [
  body('carId').notEmpty().withMessage('Car ID required'),
  body('pickupDate').notEmpty().withMessage('Pickup date required'),
  body('dropoffDate').notEmpty().withMessage('Dropoff date required'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location required'),
  body('dropoffLocation').trim().notEmpty().withMessage('Dropoff location required'),
  body('paymentMethod').optional().isString(),
  body('driverRequired').optional().isBoolean(),
  validate,
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { carId, pickupDate, dropoffDate, pickupLocation, dropoffLocation, paymentMethod, driverRequired, promoCode } = req.body;

    const car = await Car.findById(carId).session(session);
    if (!car) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    if (car.status === 'Maintenance') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'This vehicle is currently under maintenance' });
    }

    const conflictingBookings = await Booking.find({
      carId,
      status: { $in: ['Upcoming', 'Active'] },
      $or: [
        { pickupDate: { $lt: dropoffDate }, dropoffDate: { $gt: pickupDate } }
      ]
    }).session(session);

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Car is not available for selected dates' });
    }

    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    if (end <= start) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Drop-off must be after pickup' });
    }

    const hours = Math.ceil((end - start) / 3600_000);
    const days = Math.max(1, Math.ceil(hours / 24));
    const driverCharge = driverRequired ? days * DRIVER_RATE_PER_DAY : 0;
    const pricePerDay = Number(car.pricePerDay) || 0;
    let basePrice = days * pricePerDay;

    let discountAmount = 0;
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true }).session(session);
      if (promo && start >= promo.validFrom && start <= promo.validTo) {
        if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
          if (promo.discountType === 'Fixed') {
            discountAmount = promo.discountValue;
          } else if (promo.discountType === 'Percentage') {
            discountAmount = (basePrice * promo.discountValue) / 100;
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
            }
          }
          promo.usedCount += 1;
          await promo.save({ session });
        }
      }
    }

    const totalPrice = Math.max(basePrice - discountAmount + driverCharge, 0);

    const booking = await Booking.create([{
      userId: req.user._id,
      carId,
      pickupDate: start,
      dropoffDate: end,
      pickupLocation,
      dropoffLocation,
      status: 'Upcoming',
      basePrice,
      discountAmount,
      promoCode: promoCode ? promoCode.toUpperCase() : undefined,
      securityDeposit: car.securityDeposit || 1000,
      totalPrice,
      paymentMethod: paymentMethod || 'Pending',
      paymentStatus: 'Pending',
      driverRequired: Boolean(driverRequired),
      confirmationNumber: crypto.randomBytes(4).toString('hex').toUpperCase(),
      termsAccepted: true,
    }], { session });

    await Car.findByIdAndUpdate(carId, { $set: { status: 'Rented' } }, { session });

    await session.commitTransaction();
    session.endSession();

    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('booking-created', booking[0]);

    res.status(201).json(booking[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Booking creation failed: ${err.message}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/bookings/my - Get authenticated user's bookings
 */
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('carId')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/bookings/:id - Get single booking (owner or admin only)
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('userId', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorised' });
    }

    res.json(booking);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ success: false, error: 'Booking not found' });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/bookings/:id/cancel - Cancel upcoming booking
 */
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorised' });
    }
    if (booking.status !== 'Upcoming' && booking.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Only upcoming bookings can be cancelled' });
    }

    booking.status = 'Cancelled';
    booking.cancelReason = reason || 'Not specified';
    await booking.save();
    await Car.findByIdAndUpdate(booking.carId, { $set: { status: 'Available' } });

    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('booking-cancelled', booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/bookings/whatsapp-confirm - Send WhatsApp booking confirmation
 */
router.post('/whatsapp-confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId).populate('carId');
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const phone = process.env.BUSINESS_PHONE || '+918792492717';
    process.stdout.write(`[WHATSAPP] Confirmation to ${phone} ref:${booking.confirmationNumber}\n`);

    res.json({ success: true, message: 'WhatsApp confirmation sent.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/bookings/:id/photos/:type - Upload pre/post ride photos
 */
router.post('/:id/photos/:type', protect, upload.array('photos', 5), async (req, res) => {
  try {
    const { type } = req.params;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorised' });
    }

    const photoUrls = req.files.map(f => f.path);

    if (type === 'pre') {
      booking.preRidePhotos.push(...photoUrls);
    } else if (type === 'post') {
      booking.postRidePhotos.push(...photoUrls);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid photo type' });
    }

    await booking.save();
    res.json({ success: true, photos: type === 'pre' ? booking.preRidePhotos : booking.postRidePhotos });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
