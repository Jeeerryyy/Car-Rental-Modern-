const { body } = require('express-validator');

exports.createBookingRules = [
  body('carId').isMongoId().withMessage('Valid car ID required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('promoCode').optional().trim()
];

exports.validatePromoRules = [
  body('code').trim().notEmpty().withMessage('Promo code required'),
  body('carId').isMongoId().withMessage('Valid car ID required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
];