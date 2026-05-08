/**
 * Waitlist Routes - Join waitlist for unavailable cars
 * @module routes/waitlist
 */

const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const { customerProtect } = require('../middleware/auth');

/**
 * POST /api/waitlist - Join waitlist for a car
 */
router.post('/', customerProtect, async (req, res) => {
  try {
    const { carId, targetStartDate, targetEndDate } = req.body;

    const existing = await Waitlist.findOne({
      customer: req.customer._id, carId,
      targetStartDate: new Date(targetStartDate),
      targetEndDate: new Date(targetEndDate), status: 'Active'
    });

    if (existing) return res.status(400).json({ success: false, error: 'You are already on the waitlist for these dates' });

    const entry = await Waitlist.create({ customer: req.customer._id, carId, targetStartDate, targetEndDate });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
