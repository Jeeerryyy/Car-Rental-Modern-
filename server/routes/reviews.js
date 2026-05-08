/**
 * Reviews Routes - Public review listing, submission, owner management
 * @module routes/reviews
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const Review = require('../models/Review');
const validate = require('../middleware/validate');
const { customerProtect, ownerProtect } = require('../middleware/auth');

/**
 * GET /api/reviews/featured - Get featured reviews for homepage
 */
router.get('/featured', async (_req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved', featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('customer', 'name avatar')
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/reviews/car/:carId - Get approved reviews for a car
 */
router.get('/car/:carId', async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId, status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('customer', 'name avatar')
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/reviews - Get all reviews (paginated) - owner only
 */
router.get('/', ownerProtect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(limit).limit(limit)
        .populate('customer', 'name email')
        .populate('car', 'make model')
        .lean(),
      Review.countDocuments(query),
    ]);

    res.json({ success: true, data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/reviews - Submit a review (customer)
 */
router.post('/', customerProtect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be 10–1000 characters'),
  body('car').isMongoId().withMessage('Car ID is required'),
  body('booking').isMongoId().withMessage('Booking ID is required'),
  validate,
], async (req, res) => {
  try {
    const { rating, comment, car, booking } = req.body;

    const review = await Review.create({
      customer: req.customer._id,
      car,
      booking,
      rating,
      comment,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/reviews/:id/approve - Approve review (owner)
 */
router.patch('/:id/approve', ownerProtect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    review.status = 'approved';
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/reviews/:id/reject - Reject review (owner)
 */
router.patch('/:id/reject', ownerProtect, [
  body('rejectionReason').trim().isLength({ min: 1 }).withMessage('Rejection reason is required'),
  validate,
], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    review.status = 'rejected';
    review.rejectionReason = req.body.rejectionReason;
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/reviews/:id/reply - Reply to review (owner)
 */
router.post('/:id/reply', ownerProtect, [
  body('replyText').trim().isLength({ min: 1, max: 500 }).withMessage('Reply must be 1–500 characters'),
  validate,
], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    review.ownerReply = {
      text: req.body.replyText,
      createdAt: new Date()
    };
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;