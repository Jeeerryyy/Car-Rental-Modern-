/**
 * Promos Routes - Public promo validation, admin promo management
 * @module routes/promos
 */

const express = require('express');
const router = express.Router();
const Promo = require('../models/Promo');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * POST /api/promos/validate - Validate promo code for booking
 */
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Promo code required' });

    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Invalid or inactive promo code' });

    const now = new Date();
    if (now < promo.validFrom || now > promo.validTo) return res.status(400).json({ success: false, error: 'Promo code is expired or not yet active' });

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return res.status(400).json({ success: false, error: 'Promo code usage limit reached' });

    let discount = 0;
    if (promo.discountType === 'Fixed') {
      discount = promo.discountValue;
    } else if (promo.discountType === 'Percentage') {
      discount = (bookingAmount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) discount = promo.maxDiscount;
    }

    res.json({ success: true, discountAmount: discount, message: `${promo.discountType === 'Percentage' ? promo.discountValue + '% discount' : '₹' + promo.discountValue + ' off'} applied`, code: promo.code });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/promos - Create promo (admin)
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json({ success: true, data: promo });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
