import { body, query } from 'express-validator';
import { CAR_CATEGORIES } from '../utils/constants.js';

export const createCarRules = [
  body('make')
    .trim()
    .notEmpty().withMessage('Make is required')
    .isLength({ min: 2, max: 50 }).withMessage('Make must be between 2 and 50 characters'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required')
    .isLength({ min: 2, max: 50 }).withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Please enter a valid year'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CAR_CATEGORIES).withMessage(`Category must be one of: ${CAR_CATEGORIES.join(', ')}`),
  body('pricePerDay')
    .notEmpty().withMessage('Price per day is required')
    .isFloat({ min: 0.01, max: 100000 }).withMessage('Price must be a positive number up to 100000'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Color cannot exceed 30 characters')
];

export const updateCarRules = [
  body('make')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Make must be between 2 and 50 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Please enter a valid year'),
  body('category')
    .optional()
    .isIn(CAR_CATEGORIES).withMessage(`Category must be one of: ${CAR_CATEGORIES.join(', ')}`),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0.01, max: 100000 }).withMessage('Price must be a positive number up to 100000'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Color cannot exceed 30 characters')
];
