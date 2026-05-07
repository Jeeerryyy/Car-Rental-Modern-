/**
 * Newsletter Routes - Email subscription
 * @module routes/newsletter
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const Newsletter = require('../models/Newsletter');
const validate = require('../middleware/validate');

/**
 * POST /api/newsletter/subscribe - Subscribe to newsletter
 */
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  validate,
], async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await Newsletter.findOne({ email }).lean();
    if (exists) return res.json({ success: true, message: 'Already subscribed!' });
    await Newsletter.create({ email });
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
