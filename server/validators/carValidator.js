const { body, param } = require('express-validator');

exports.createCarRules = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('category').isIn(['sedan', 'suv', 'luxury', 'sports', 'van', 'bike']).withMessage('Invalid category'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be positive'),
  body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('seats').isInt({ min: 1 }).withMessage('Seats must be at least 1'),
  body('transmission').isIn(['Automatic', 'Manual']).withMessage('Invalid transmission'),
  body('fuelType').isIn(['Petrol', 'Diesel', 'CNG', 'Electric']).withMessage('Invalid fuel type'),
  body('location.coordinates.lat').optional().isFloat().withMessage('Invalid latitude'),
  body('location.coordinates.lng').optional().isFloat().withMessage('Invalid longitude')
];

exports.updateCarRules = [
  body('make').optional().trim().notEmpty().withMessage('Make cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty'),
  body('year').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('category').optional().isIn(['sedan', 'suv', 'luxury', 'sports', 'van', 'bike']).withMessage('Invalid category'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('description').optional().isLength({ min: 20 }).withMessage('Description too short')
];

exports.calendarBlockRules = [
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
];