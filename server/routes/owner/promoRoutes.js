const express = require('express');
const router = express.Router();
const Promo = require('../../models/Promo');
const { ownerProtect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createPromoRules, updatePromoRules } = require('../../validators/promoValidator');

router.get('/', ownerProtect, async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch promos' });
  }
});

router.post('/', ownerProtect, createPromoRules, validate, async (req, res) => {
  try {
    const promo = await Promo.create({ ...req.body, code: req.body.code.toUpperCase() });
    res.status(201).json({ success: true, data: promo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create promo' });
  }
});

router.put('/:id', ownerProtect, updatePromoRules, validate, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: promo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update promo' });
  }
});

router.delete('/:id', ownerProtect, async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo not found' });
    }
    if (promo.usedCount > 0) {
      promo.isActive = false;
      await promo.save();
      return res.json({ success: true, deactivated: true });
    }
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true, deleted: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete promo' });
  }
});

module.exports = router;