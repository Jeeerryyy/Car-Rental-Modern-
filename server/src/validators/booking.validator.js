import { body } from 'express-validator';

export const createBookingRules = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid Car ID format'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Please enter a valid date')
    .custom((value) => {
      const start = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Please enter a valid date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
  body('promoCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Invalid promo code'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim()
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits')
];
