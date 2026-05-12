import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate field: ${field}`,
      code: 'DUPLICATE_ERROR'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (err.type === 'RazorpayError') {
    return res.status(402).json({
      success: false,
      message: 'Payment error occurred',
      code: 'PAYMENT_ERROR'
    });
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (config.nodeEnv === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
