const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');

const Review   = require('../models/Review');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/authMiddleware');

/* ── public: featured reviews for homepage ───────────────── */
router.get('/featured', async (_req, res) => {
  try {
    const reviews = await Review.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('[reviews/featured]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── public: all reviews (paginated) ─────────────────────── */
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(),
    ]);

    res.json({
      success: true, data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[reviews/list]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── public: submit a review (authenticated users) ───────── */
router.post('/', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('text').trim().isLength({ min: 10, max: 500 }).withMessage('Review must be 10–500 characters'),
  body('vehicle').optional().trim(),
  body('tripType').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const { rating, text, vehicle, tripType } = req.body;

    const review = await Review.create({
      name: req.user.name,
      rating,
      text,
      vehicle,
      tripType,
      verified: true,
      avatar: null,
      featured: false,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('[reviews/create]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── admin: toggle featured ──────────────────────────────── */
router.patch('/:id/feature', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    review.featured = !review.featured;
    await review.save();

    res.json({ success: true, data: review });
  } catch (err) {
    console.error('[reviews/feature]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── admin: delete review ────────────────────────────────── */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, message: 'Review removed' });
  } catch (err) {
    console.error('[reviews/delete]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
