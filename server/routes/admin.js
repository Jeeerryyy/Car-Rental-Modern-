const express  = require('express');
const router   = express.Router();

const Car      = require('../models/Car');
const Booking  = require('../models/Booking');
const User     = require('../models/User');
const paginate = require('../middleware/paginate');
const { protect, admin } = require('../middleware/authMiddleware');

const CAR_FIELDS = [
  'make', 'model', 'year', 'category', 'transmission', 'seats',
  'fuelType', 'driveOption', 'securityDeposit', 'pricePerDay',
  'status', 'images', 'licensePlate', 'features',
];

const STATUS_FLOW = {
  Upcoming:  ['Active', 'Cancelled'],
  Active:    ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

function pick(src, keys) {
  const out = {};
  for (const k of keys) if (src[k] !== undefined) out[k] = src[k];
  return out;
}

/* ━━ fleet CRUD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

router.get('/cars', protect, admin, async (_req, res) => {
  try {
    res.json(await Car.find().sort({ createdAt: -1 }).lean());
  } catch (err) {
    console.error('[admin/cars]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/cars', protect, admin, async (req, res) => {
  try {
    const car = await Car.create(pick(req.body, CAR_FIELDS));
    res.status(201).json(car);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: Object.values(err.errors)[0].message });
    }
    console.error('[admin/cars/create]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/cars/:id', protect, admin, async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      pick(req.body, CAR_FIELDS),
      { new: true, runValidators: true },
    );
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error('[admin/cars/update]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/cars/:id', protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.status === 'Rented') {
      return res.status(400).json({ success: false, error: 'Cannot remove a rented vehicle' });
    }
    await car.deleteOne();
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (err) {
    console.error('[admin/cars/delete]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ━━ bookings ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

router.get('/bookings', protect, admin, paginate, async (req, res) => {
  try {
    const { skip, limit, page } = req.pagination;
    const [data, total] = await Promise.all([
      Booking.find()
        .populate('carId')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit).lean(),
      Booking.countDocuments(),
    ]);

    res.json({
      success: true, data,
      pagination: {
        total, page, limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('[admin/bookings]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/bookings/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const allowed = STATUS_FLOW[booking.status];
    if (!allowed?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from "${booking.status}" to "${status}"`,
      });
    }

    const prev = booking.status;
    booking.status = status;
    await booking.save();

    // sync vehicle availability
    if (['Cancelled', 'Completed'].includes(status) && ['Active', 'Upcoming'].includes(prev)) {
      await Car.findByIdAndUpdate(booking.carId, { status: 'Available' });
    } else if (status === 'Active') {
      await Car.findByIdAndUpdate(booking.carId, { status: 'Rented' });
    }

    const updated = await Booking.findById(req.params.id)
      .populate('carId').populate('userId', 'name email phone');
    res.json(updated);
  } catch (err) {
    console.error('[admin/bookings/update]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ━━ analytics (aggregation pipeline) ━━━━━━━━━━━━━━━━━━━━━ */

router.get('/analytics', protect, admin, async (_req, res) => {
  try {
    const [revAgg, ratingAgg, counts, recent] = await Promise.all([
      Booking.aggregate([
        { $match: { status: { $in: ['Active', 'Upcoming', 'Completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
      Promise.all([
        Booking.countDocuments({ status: { $in: ['Active', 'Upcoming'] } }),
        Car.countDocuments(),
        Car.countDocuments({ status: 'Rented' }),
        User.countDocuments({ role: 'user' }),
        Booking.countDocuments(),
      ]),
      Booking.find()
        .populate('carId', 'make model')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const [activeBookings, totalCars, rentedCars, totalUsers, totalBookings] = counts;

    res.json({
      revenueTotal: revAgg[0]?.total ?? 0,
      activeBookingsCount: activeBookings,
      fleetUtilization: totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0,
      avgRating: ratingAgg[0]?.avg?.toFixed(1) ?? null,
      totalUsers, totalCars, totalBookings,
      recentBookings: recent.map((b) => ({
        _id: b._id,
        confirmationNumber: b.confirmationNumber,
        clientName: b.userId?.name ?? 'Unknown',
        clientEmail: b.userId?.email ?? '',
        vehicle: b.carId ? `${b.carId.make} ${b.carId.model}` : 'Unknown',
        pickupDate: b.pickupDate,
        dropoffDate: b.dropoffDate,
        totalPrice: b.totalPrice,
        status: b.status,
      })),
    });
  } catch (err) {
    console.error('[admin/analytics]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
