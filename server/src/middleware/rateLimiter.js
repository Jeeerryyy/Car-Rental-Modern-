import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../utils/constants.js';
import { config } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: config.disableRateLimit ? 999999 : RATE_LIMIT.AUTH_MAX,
  skip: () => config.disableRateLimit,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: config.disableRateLimit ? 999999 : RATE_LIMIT.GENERAL_MAX,
  skip: () => config.disableRateLimit,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
