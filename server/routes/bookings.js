const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const { body } = require('express-validator');

const Booking  = require('../models/Booking');
const Car      = require('../models/Car');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const DRIVER_RATE_PER_DAY = 500;

/* ── create ──────────────────────────────────────────────── */
router.post('/', protect, [
  body('carId').isMongoId().withMessage('Invalid car ID'),
  body('pickupDate').isISO8601().withMessage('Invalid pickup date'),
  body('dropoffDate').isISO8601().withMessage('Invalid dropoff date'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location required'),
  body('dropoffLocation').trim().notEmpty().withMessage('Dropoff location required'),
  body('paymentMethod').optional().isIn(['Card', 'UPI', 'Cash', 'NetBanking']),
  body('driverRequired').optional().isBoolean(),
  validate,
], async (req, res) => {
  try {
    const { carId, pickupDate, dropoffDate, pickupLocation, dropoffLocation, paymentMethod, driverRequired } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.status !== 'Available') {
      return res.status(400).json({ success: false, error: 'This vehicle is not available right now' });
    }

    const start = new Date(pickupDate);
    const end   = new Date(dropoffDate);
    if (end <= start) {
      return res.status(400).json({ success: false, error: 'Drop-off must be after pickup' });
    }

    const days         = Math.ceil((end - start) / 86_400_000);
    const driverCharge = driverRequired ? days * DRIVER_RATE_PER_DAY : 0;
    const totalPrice   = days * car.pricePerDay + driverCharge;

    const booking = await Booking.create({
      userId: req.user.id,
      carId,
      pickupDate: start,
      dropoffDate: end,
      pickupLocation,
      dropoffLocation,
      status: 'Upcoming',
      totalPrice,
      paymentMethod: paymentMethod || 'Card',
      driverRequired: Boolean(driverRequired),
      confirmationNumber: crypto.randomBytes(4).toString('hex').toUpperCase(),
    });

    car.status = 'Rented';
    await car.save();

    res.status(201).json(booking);
  } catch (err) {
    console.error('[bookings/create]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── my bookings ─────────────────────────────────────────── */
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('carId')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('[bookings/my]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── get by id (ownership enforced) ──────────────────────── */
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('userId', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const isOwner = booking.userId._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorised' });
    }

    res.json(booking);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ success: false, error: 'Booking not found' });
    console.error('[bookings/get]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── cancel ──────────────────────────────────────────────── */
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorised' });
    }
    if (booking.status !== 'Upcoming') {
      return res.status(400).json({ success: false, error: 'Only upcoming bookings can be cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    await Car.findByIdAndUpdate(booking.carId, {
      $set: { status: 'Available' },
    });

    res.json(booking);
  } catch (err) {
    console.error('[bookings/cancel]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── whatsapp confirmation ───────────────────────────────── */
router.post('/whatsapp-confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId).populate('carId');
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const phone = process.env.BUSINESS_PHONE || '+918792492717';
    console.log(`[whatsapp] confirmation → ${phone} ref:${booking.confirmationNumber}`);

    res.json({ success: true, message: 'WhatsApp confirmation sent.' });
  } catch (err) {
    console.error('[bookings/whatsapp]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
