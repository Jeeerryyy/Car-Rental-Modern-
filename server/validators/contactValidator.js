const { body } = require('express-validator');

exports.contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters')
];