const express = require('express');
const router = express.Router();
const { ownerProtect } = require('../../middleware/auth');

router.get('/', ownerProtect, async (req, res) => {
  res.json({ success: true, data: req.owner.businessSettings });
});

router.put('/', ownerProtect, async (req, res) => {
  try {
    const updates = req.body;
    req.owner.businessSettings = { ...req.owner.businessSettings, ...updates };
    await req.owner.save();
    res.json({ success: true, data: req.owner.businessSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router;