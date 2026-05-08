/**
 * Waitlist Routes - Join waitlist for unavailable cars
 * @module routes/waitlist
 */

const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const { protect } = require('../middleware/authMiddleware');

/**
 * POST /api/waitlist - Join waitlist for a car
 */
router.post('/', protect, async (req, res) => {
  try {
    const { carId, targetStartDate, targetEndDate } = req.body;

    const existing = await Waitlist.findOne({
      userId: req.user._id, carId,
      targetStartDate: new Date(targetStartDate),
      targetEndDate: new Date(targetEndDate), status: 'Active'
    });

    if (existing) return res.status(400).json({ success: false, error: 'You are already on the waitlist for these dates' });

    const entry = await Waitlist.create({ userId: req.user._id, carId, targetStartDate, targetEndDate });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
