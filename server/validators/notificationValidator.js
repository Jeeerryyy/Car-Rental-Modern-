const { body, param } = require('express-validator');

const getNotificationsValidation = [
  param('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  param('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('type').optional().isIn(['booking', 'payment', 'system', 'promo']).withMessage('Invalid notification type'),
  body('read').optional().isBoolean().withMessage('Read must be a boolean')
];

const markAsReadValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID')
];

const markAllAsReadValidation = [];

const deleteNotificationValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID')
];

module.exports = {
  getNotificationsValidation,
  markAsReadValidation,
  markAllAsReadValidation,
  deleteNotificationValidation
};