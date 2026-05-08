const { body } = require('express-validator');

exports.createReviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  body('car').isMongoId().withMessage('Valid car ID required'),
  body('booking').isMongoId().withMessage('Valid booking ID required')
];