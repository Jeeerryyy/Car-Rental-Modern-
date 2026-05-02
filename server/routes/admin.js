/**
 * Admin Routes - Fleet management, bookings, analytics, promos (admin only)
 * @module routes/admin
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Promo = require('../models/Promo');
const paginate = require('../middleware/paginate');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { generateInvoice } = require('../services/InvoiceService');
const { sendInvoiceEmail } = require('../services/NotificationService');
const { invalidateCachePattern } = require('../utils/cache');
const logger = require('../utils/logger');

const CAR_FIELDS = ['make', 'model', 'year', 'category', 'transmission', 'seats', 'fuelType', 'driveOption', 'securityDeposit', 'pricePerDay', 'status', 'images', 'licensePlate', 'features'];

const STATUS_FLOW = { Upcoming: ['Active', 'Cancelled'], Active: ['Completed', 'Cancelled'], Completed: [], Cancelled: [] };

/**
 * Extract allowed fields from request body
 */
function pick(src, keys) {
  const out = {};
  for (const key of keys) if (src[key] !== undefined) out[key] = src[key];
  return out;
}

/**
 * GET /api/admin/cars - List all cars (admin)
 */
router.get('/cars', protect, admin, async (_req, res) => {
  try {
    res.json(await Car.find().sort({ createdAt: -1 }).lean());
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/admin/cars - Create new car
 */
router.post('/cars', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const carData = pick(req.body, CAR_FIELDS);

    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(file => file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    } else if (req.body.images && typeof req.body.images === 'string') {
      carData.images = [req.body.images];
    } else if (req.body.images && Array.isArray(req.body.images)) {
      carData.images = req.body.images;
    }

    if (!carData.images || carData.images.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one vehicle image is required.' });
    }

    const car = await Car.create(carData);
    
    invalidateCachePattern('cars:*').catch(() => {});
    
    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('car-created', car);
    res.status(201).json(car);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ success: false, error: Object.values(err.errors)[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/admin/cars/:id - Update car
 */
router.patch('/cars/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const carData = pick(req.body, CAR_FIELDS);

    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(file => file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    } else if (req.body.images && typeof req.body.images === 'string') {
      carData.images = [req.body.images];
    }

    const car = await Car.findByIdAndUpdate(req.params.id, carData, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    
    invalidateCachePattern('cars:*').catch(() => {});
    
    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('car-updated', car);
    
    res.json(car);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * DELETE /api/admin/cars/:id - Delete car (only if not rented)
 */
router.delete('/cars/:id', protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.status === 'Rented') return res.status(400).json({ success: false, error: 'Cannot remove a rented vehicle' });
    await car.deleteOne();
    
    invalidateCachePattern('cars:*').catch(() => {});
    
    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('car-deleted', { id: req.params.id });
    
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/admin/bookings - List all bookings (paginated)
 */
router.get('/bookings', protect, admin, paginate, async (req, res) => {
  try {
    const { skip, limit, page } = req.pagination;
    const [data, total] = await Promise.all([
      Booking.find().populate('carId').populate('userId', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(),
    ]);

    res.json({ success: true, data, pagination: { total, page, limit, pages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/admin/bookings/:id - Update booking status
 */
router.patch('/bookings/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const allowed = STATUS_FLOW[booking.status];
    if (!allowed?.includes(status)) return res.status(400).json({ success: false, error: `Cannot transition from "${booking.status}" to "${status}"` });

    const prev = booking.status;
    booking.status = status;
    await booking.save();

    if (['Cancelled', 'Completed'].includes(status) && ['Active', 'Upcoming'].includes(prev)) {
      await Car.findByIdAndUpdate(booking.carId, { status: 'Available' });
    } else if (status === 'Active') {
      await Car.findByIdAndUpdate(booking.carId, { status: 'Rented' });
    }

    const updated = await Booking.findById(req.params.id).populate('carId').populate('userId', 'name email phone');
    
    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('booking-updated', updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/admin/bookings/:id/complete - Complete booking with extra charges
 */
router.post('/bookings/:id/complete', protect, admin, async (req, res) => {
  try {
    const { fuelOverageCharge = 0, lateReturnPenalty = 0, tollCharges = 0 } = req.body;

    const booking = await Booking.findById(req.params.id).populate('carId').populate('userId', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.status === 'Completed') return res.status(400).json({ success: false, error: 'Booking already completed' });

    booking.fuelOverageCharge = Number(fuelOverageCharge);
    booking.lateReturnPenalty = Number(lateReturnPenalty);
    booking.tollCharges = Number(tollCharges);
    booking.finalBilledAmount = booking.totalPrice + booking.fuelOverageCharge + booking.lateReturnPenalty + booking.tollCharges;
    booking.status = 'Completed';
    await booking.save();

    await Car.findByIdAndUpdate(booking.carId._id, { status: 'Available' });

    const userForInvoice = booking.userId || { 
      name: booking.manualName || 'Offline Customer', 
      email: 'N/A', 
      phone: booking.manualPhone || 'N/A' 
    };

    const invoicePath = await generateInvoice(booking, userForInvoice, booking.carId);
    
    if (booking.userId && booking.userId.email) {
      sendInvoiceEmail(booking.userId, booking, invoicePath).catch(() => {});
    }

    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('booking-completed', booking);

    res.json({ success: true, booking, invoicePath });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/admin/bookings/manual - Create manual/offline booking
 */
router.post('/bookings/manual', protect, admin, async (req, res) => {
  try {
    const { carId, manualName, manualPhone, startDate, endDate, totalAmount, pickupLocation, dropLocation } = req.body;
    
    const booking = await Booking.create({
      carId,
      manualName,
      manualPhone,
      pickupDate: startDate,
      dropoffDate: endDate,
      totalPrice: totalAmount,
      pickupLocation: pickupLocation || 'Showroom',
      dropoffLocation: dropLocation || 'Showroom',
      source: 'offline',
      status: 'Upcoming',
      confirmationNumber: 'OFF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      paymentStatus: 'Paid',
      paymentMethod: 'Cash'
    });

    const populated = await Booking.findById(booking._id).populate('carId');
    
    const io = req.app.get('io');
    if (io) io.to('owner-dashboard').emit('booking-created', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/admin/users - List all customers (paginated)
 */
router.get('/users', protect, admin, paginate, async (req, res) => {
  try {
    const { skip, limit, page } = req.pagination;
    const [data, total] = await Promise.all([
      User.find({ role: 'user' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({ role: 'user' })
    ]);
    res.json({ success: true, data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/admin/analytics - Dashboard analytics with aggregations
 */
router.get('/analytics', protect, admin, async (_req, res) => {
  try {
    const [revAgg, ratingAgg, counts, recent, monthlyRevAgg, classDistAgg] = await Promise.all([
      Booking.aggregate([{ $match: { status: { $in: ['Active', 'Upcoming', 'Completed'] } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Booking.aggregate([{ $match: { rating: { $exists: true, $ne: null } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Promise.all([Booking.countDocuments({ status: { $in: ['Active', 'Upcoming'] } }), Car.countDocuments(), Car.countDocuments({ status: 'Rented' }), User.countDocuments({ role: 'user' }), Booking.countDocuments()]),
      Booking.find().populate('carId', 'make model').populate('userId', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
      Booking.aggregate([{ $match: { status: { $in: ['Active', 'Upcoming', 'Completed'] } } }, { $group: { _id: { $month: '$pickupDate' }, revenue: { $sum: '$totalPrice' } } }, { $sort: { _id: 1 } }]),
      Car.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
    ]);

    const [activeBookings, totalCars, rentedCars, totalUsers, totalBookings] = counts;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const revenueData = [];
    for (let i = 1; i <= 6; i++) {
      const monthIndex = new Date().getMonth() - 6 + i;
      const actualMonth = monthIndex < 0 ? monthIndex + 12 : monthIndex;
      const monthNum = actualMonth + 1;
      const found = monthlyRevAgg.find(m => m._id === monthNum);
      revenueData.push({ name: monthNames[actualMonth], revenue: found ? found.revenue : 0 });
    }

    const classDistribution = classDistAgg.map(c => ({ name: c._id || 'Unknown', value: c.count }));

    res.json({
      revenueTotal: revAgg[0]?.total ?? 0,
      activeBookingsCount: activeBookings,
      fleetUtilization: totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0,
      avgRating: ratingAgg[0]?.avg?.toFixed(1) ?? null,
      totalUsers, totalCars, totalBookings, revenueData, classDistribution,
      recentBookings: recent.map((b) => ({
        _id: b._id, confirmationNumber: b.confirmationNumber,
        clientName: b.userId?.name ?? 'Unknown', clientEmail: b.userId?.email ?? '',
        vehicle: b.carId ? `${b.carId.make} ${b.carId.model}` : 'Unknown',
        pickupDate: b.pickupDate, dropoffDate: b.dropoffDate, totalPrice: b.totalPrice, status: b.status,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/admin/cars/:id/toggle-popular - Toggle popular flag
 */
router.patch('/cars/:id/toggle-popular', protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    car.isPopular = !car.isPopular;
    await car.save();
    res.json({ success: true, isPopular: car.isPopular });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/admin/cars/:id/toggle-featured - Toggle featured flag
 */
router.patch('/cars/:id/toggle-featured', protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    car.isFeatured = !car.isFeatured;
    await car.save();
    res.json({ success: true, isFeatured: car.isFeatured });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/admin/promos - List all promos
 */
router.get('/promos', protect, admin, async (_req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 }).lean();
    res.json(promos);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/admin/promos - Create promo
 */
router.post('/promos', protect, admin, async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'Promo code already exists' });
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/promos/:id - Update promo
 */
router.patch('/promos/:id', protect, admin, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promo not found' });
    res.json(promo);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/promos/:id - Delete promo
 */
router.delete('/promos/:id', protect, admin, async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Promo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
