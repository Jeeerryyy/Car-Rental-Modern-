const { body } = require('express-validator');

exports.createPromoRules = [
  body('code').trim().isLength({ min: 4, max: 20 }).matches(/^[A-Z0-9]+$/).withMessage('Code must be 4-20 alphanumeric characters'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be positive'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiry date required'),
  body('minimumBookingAmount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be positive')
];

exports.updatePromoRules = [
  body('code').optional().trim().isLength({ min: 4, max: 20 }).matches(/^[A-Z0-9]+$/),
  body('discountType').optional().isIn(['percentage', 'fixed']),
  body('discountValue').optional().isFloat({ min: 0 }),
  body('maxUses').optional().isInt({ min: 1 }),
  body('expiresAt').optional().isISO8601(),
  body('minimumBookingAmount').optional().isFloat({ min: 0 })
];