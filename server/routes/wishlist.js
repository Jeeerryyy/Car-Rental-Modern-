/**
 * Wishlist Routes - User's saved cars
 * @module routes/wishlist
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/wishlist - Get user's wishlist
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/wishlist/:carId - Add car to wishlist
 */
router.post('/:carId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(req.params.carId)) return res.status(400).json({ success: false, error: 'Already in wishlist' });
    user.wishlist.push(req.params.carId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * DELETE /api/wishlist/:carId - Remove car from wishlist
 */
router.delete('/:carId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.carId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
