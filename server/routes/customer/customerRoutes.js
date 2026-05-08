const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const Booking = require('../../models/Booking');
const { customerProtect } = require('../../middleware/auth');

router.get('/me', customerProtect, async (req, res) => {
  res.json({ 
    success: true, 
    data: {
      id: req.customer._id,
      name: req.customer.name,
      email: req.customer.email,
      phone: req.customer.phone,
      avatar: req.customer.avatar,
      idVerificationStatus: req.customer.idVerificationStatus
    }
  });
});

router.put('/profile', customerProtect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name) req.customer.name = name;
    if (phone) req.customer.phone = phone;
    await req.customer.save();
    res.json({ success: true, data: req.customer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.put('/change-password', customerProtect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.customer._id).select('+password');
    const isMatch = await customer.correctPassword(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    customer.password = newPassword;
    await customer.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

router.get('/stats', customerProtect, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ 
      customer: req.customer._id,
      status: { $in: ['confirmed', 'completed'] }
    });
    
    const memberSince = req.customer.createdAt;
    
    const bookings = await Booking.find({
      customer: req.customer._id,
      status: { $in: ['confirmed', 'completed'] },
      paymentStatus: 'paid'
    });
    
    const totalSpent = bookings.reduce((sum, b) => sum + (b.finalTotal || 0), 0);
    
    res.json({ success: true, data: { totalBookings, memberSince, totalSpent } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

router.get('/bookings', customerProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find({ customer: req.customer._id })
        .populate('car', 'make model images pricePerDay')
        .populate('promoCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ customer: req.customer._id })
    ]);
    
    res.json({ 
      success: true, 
      data: bookings,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

router.get('/bookings/:id', customerProtect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.customer._id })
      .populate('car')
      .populate('customer', 'name email phone')
      .populate('promoCode');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
});

router.get('/notifications', customerProtect, async (req, res) => {
  try {
    const Notification = require('../../models/Notification');
    const notifications = await Notification.find({ recipientType: 'customer', recipient: req.customer._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ 
      recipientType: 'customer', 
      recipient: req.customer._id, 
      isRead: false 
    });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', customerProtect, async (req, res) => {
  try {
    const Notification = require('../../models/Notification');
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

module.exports = router;