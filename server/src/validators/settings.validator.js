import { body } from 'express-validator';

export const updateSettingsRules = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Business name cannot exceed 100 characters'),
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email'),
  body('contactPhone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('cancellationPolicy')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Policy cannot exceed 1000 characters'),
  body('pickupLocations')
    .optional()
    .isArray().withMessage('Pickup locations must be an array'),
  body('pickupLocations.*')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Each location cannot exceed 100 characters')
];
