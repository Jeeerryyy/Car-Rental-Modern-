const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const { ownerProtect } = require('../middleware/auth');

router.use(ownerProtect);
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

router.use(ownerProtect);

router.get('/stats', async (req, res) => {
  try {
    const totalCars = await Car.countDocuments({ isDeleted: false });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalCustomers = await Customer.countDocuments();
    
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid', createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, total: { $sum: '$finalTotal' } } }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        totalCars,
        totalBookings,
        activeBookings,
        totalCustomers,
        monthlyRevenue: revenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

router.get('/clients', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      Customer.find().select('name email phone createdAt idVerificationStatus').skip(skip).limit(limit),
      Customer.countDocuments()
    ]);
    
    res.json({ success: true, data: customers, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch clients' });
  }
});

router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.owner._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cars' });
  }
});

router.get('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, owner: req.owner._id });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch car' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('car', 'make model images').populate('customer', 'name email phone')
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

module.exports = router;