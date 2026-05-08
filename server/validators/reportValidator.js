const { body, query } = require('express-validator');

const getReportsValidation = [
  query('type').optional().isIn(['bookings', 'revenue', 'cars', 'customers']).withMessage('Invalid report type'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
];

const exportReportValidation = [
  query('type').isIn(['bookings', 'revenue', 'cars', 'customers']).withMessage('Invalid report type'),
  query('startDate').isISO8601().withMessage('Start date is required'),
  query('endDate').isISO8601().withMessage('End date is required'),
  query('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid format')
];

module.exports = {
  getReportsValidation,
  exportReportValidation
};