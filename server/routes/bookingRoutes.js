const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Promo = require('../models/Promo');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const { customerProtect, ownerProtect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingRules, validatePromoRules } = require('../validators/bookingValidator');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Validate promo code
router.post('/validate-promo', customerProtect, validatePromoRules, validate, async (req, res) => {
  try {
    const { code, carId, startDate, endDate } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(400).json({ success: false, valid: false, message: 'Invalid promo code' });
    
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ success: false, valid: false, message: 'Promo code has expired' });
    }
    
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ success: false, valid: false, message: 'Promo code usage limit reached' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const subtotal = totalDays * car.pricePerDay + (car.securityDeposit || 0);
    
    if (promo.minimumBookingAmount && subtotal < promo.minimumBookingAmount) {
      return res.status(400).json({ success: false, valid: false, message: `Minimum booking amount is ₹${promo.minimumBookingAmount}` });
    }
    
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = subtotal * (promo.discountValue / 100);
    } else {
      discountAmount = promo.discountValue;
    }
    
    const finalTotal = subtotal - discountAmount;
    
    res.json({ 
      success: true, 
      valid: true, 
      discountAmount, 
      finalTotal, 
      description: `${promo.discountType === 'percentage' ? promo.discountValue + '%' : '₹' + promo.discountValue} off` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to validate promo' });
  }
});

// Create booking
router.post('/', customerProtect, createBookingRules, validate, async (req, res) => {
  try {
    // BR-2: KYC Gate
    if (req.customer.idVerificationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Complete identity verification before booking.' });
    }
    
    const { carId, startDate, endDate, promoCode } = req.body;
    const car = await Car.findById(carId);
    if (!car || !car.isActive || car.isDeleted) {
      return res.status(404).json({ success: false, message: 'Car not available' });
    }
    
    // Check calendar blocks
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const hasBlock = car.unavailableDates?.some(block => {
      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);
      return start <= blockEnd && end >= blockStart;
    });
    
    if (hasBlock) {
      return res.status(409).json({ success: false, message: 'Car unavailable for maintenance during those dates.' });
    }
    
    // Check booking conflicts
    const conflict = await Booking.findOne({
      car: carId,
      status: { $nin: ['cancelled', 'rejected'] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });
    
    if (conflict) {
      return res.status(409).json({ success: false, message: 'Car already booked for those dates.' });
    }
    
    // BR-1: Calculate price server-side
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const basePrice = totalDays * car.pricePerDay;
    const securityDeposit = car.securityDeposit || 2000;
    let subtotal = basePrice + securityDeposit;
    let discountAmount = 0;
    let appliedPromo = null;
    
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && (!promo.expiresAt || promo.expiresAt > new Date()) && (!promo.maxUses || promo.usedCount < promo.maxUses)) {
        if (!promo.minimumBookingAmount || subtotal >= promo.minimumBookingAmount) {
          if (promo.discountType === 'percentage') {
            discountAmount = subtotal * (promo.discountValue / 100);
          } else {
            discountAmount = promo.discountValue;
          }
          appliedPromo = promo.code;
          await Promo.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
        }
      }
    }
    
    const finalTotal = subtotal - discountAmount;
    
    const owner = await Owner.findOne();
    const requireApproval = owner?.businessSettings?.requireManualApproval || false;
    
    const booking = await Booking.create({
      car: carId,
      customer: req.customer._id,
      startDate: start,
      endDate: end,
      totalDays,
      basePrice,
      securityDeposit,
      discountAmount,
      finalTotal,
      promoCode: appliedPromo,
      status: requireApproval ? 'pending_approval' : 'pending',
      paymentStatus: 'pending'
    });
    
    let razorpayOrder = null;
    let razorpayKeyId = null;
    
    if (!requireApproval && process.env.RAZORPAY_KEY_ID) {
      razorpayOrder = await razorpay.orders.create({
        amount: finalTotal * 100,
        currency: 'INR',
        receipt: `booking_${booking._id}`
      });
      booking.razorpayOrderId = razorpayOrder.id;
      await booking.save();
      razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    }
    
    res.status(201).json({ 
      success: true, 
      data: booking, 
      requiresApproval,
      razorpayOrderId: razorpayOrder?.id,
      razorpayKeyId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// Verify payment
router.post('/verify-payment', customerProtect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id, customer: req.customer._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(razorpay_signature))) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save();
    
    // Update car stats
    await Car.findByIdAndUpdate(booking.car, { $inc: { totalBookings: 1 } });
    
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Cancel booking
router.put('/:id/cancel', customerProtect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.customer._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    
    const owner = await Owner.findOne();
    const policyHours = owner?.businessSettings?.cancellationPolicyHours || 24;
    const hoursUntilStart = (new Date(booking.startDate) - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntilStart < policyHours) {
      return res.status(400).json({ success: false, message: `Cannot cancel within ${policyHours} hours of start time` });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

// Owner routes
router.get('/owner/all', ownerProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find().populate('car', 'make model images').populate('customer', 'name email phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments()
    ]);
    
    res.json({ success: true, data: bookings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

router.put('/owner/:id/status', ownerProtect, async (req, res) => {
  try {
    const { status, rejectionReason, paymentHandledManually } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    if (status === 'confirmed') {
      booking.status = 'confirmed';
      if (paymentHandledManually) {
        booking.paymentStatus = 'manual_collection';
      } else if (process.env.RAZORPAY_KEY_ID) {
        const order = await razorpay.orders.create({
          amount: booking.finalTotal * 100,
          currency: 'INR',
          receipt: `booking_${booking._id}`
        });
        booking.razorpayOrderId = order.id;
      }
    } else if (status === 'rejected') {
      booking.status = 'rejected';
      booking.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      booking.status = 'completed';
    }
    
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
});

// Manual booking (owner)
router.post('/owner/manual', ownerProtect, async (req, res) => {
  try {
    const { carId, customerName, customerEmail, startDate, endDate, priceOverride, notes } = req.body;
    
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const basePrice = totalDays * car.pricePerDay;
    const securityDeposit = car.securityDeposit || 2000;
    const finalTotal = priceOverride || (basePrice + securityDeposit);
    
    let customer = null;
    if (customerEmail) {
      customer = await Customer.findOne({ email: customerEmail });
      if (!customer) {
        customer = await Customer.create({ 
          name: customerName || 'Walk-in Customer', 
          email: customerEmail,
          password: 'temp_' + Date.now()
        });
      }
    }
    
    const booking = await Booking.create({
      car: carId,
      customer: customer?._id,
      startDate: start,
      endDate: end,
      totalDays,
      basePrice,
      securityDeposit,
      finalTotal,
      status: 'confirmed',
      paymentStatus: 'manual_collection',
      notes
    });
    
    await Car.findByIdAndUpdate(carId, { $inc: { totalBookings: 1 } });
    
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create manual booking' });
  }
});

module.exports = router;