import { body } from 'express-validator';
import { PROMO_TYPES } from '../utils/constants.js';

export const createPromoRules = [
  body('code')
    .trim()
    .notEmpty().withMessage('Code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('Code must be uppercase alphanumeric only'),
  body('discountType')
    .notEmpty().withMessage('Discount type is required')
    .isIn(Object.values(PROMO_TYPES)).withMessage('Invalid discount type'),
  body('discountValue')
    .notEmpty().withMessage('Discount value is required')
    .isFloat({ min: 0.01 }).withMessage('Discount value must be positive'),
  body('maxUses')
    .notEmpty().withMessage('Max uses is required')
    .isInt({ min: 1 }).withMessage('Max uses must be a positive integer'),
  body('expiresAt')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Please enter a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum order value must be non-negative')
];

export const validatePromoRules = [
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('orderValue').optional().isFloat({ min: 0 })
];
