import { RATE_LIMIT } from '../utils/constants.js';
import { config } from '../config/env.js';
import { cacheService } from '../config/redis.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Creates an Express rate limiting middleware.
 * Uses Redis/Memory cache for distributed/local rate limiting with graceful fail-open behaviour.
 */
const createRateLimiter = (options) => {
  return async (req, res, next) => {
    if (config.disableRateLimit || config.nodeEnv === 'development') {
      return next();
    }

    const { prefix, windowMs, max, message } = options;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Rate limit based on userId if authenticated, otherwise fallback to IP address
    const identity = req.user ? req.user._id.toString() : ip;
    const key = `ratelimit:${prefix}:${identity}`;

    try {
      const hits = await cacheService.get(key);

      if (hits !== null && hits >= max) {
        logger.warn(`[Rate Limit] Action blocked. Prefix: ${prefix}, Identity: ${identity}`);
        return ApiResponse.error(res, 429, message);
      }

      if (hits === null) {
        // Initialize the window counter with TTL matching windowMs
        await cacheService.set(key, 1, Math.ceil(windowMs / 1000));
      } else {
        await cacheService.incr(key);
      }

      next();
    } catch (err) {
      // In case of any rate limiting storage failure, we fail-open to ensure service uptime
      logger.error(`[Rate Limit] Processing failed: ${err.message}. Fail-open allowed request.`);
      next();
    }
  };
};

export const authLimiter = createRateLimiter({
  prefix: 'auth',
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS || 900000, // 15 minutes
  max: RATE_LIMIT.AUTH_MAX || 5,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

export const generalLimiter = createRateLimiter({
  prefix: 'general',
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS || 60000, // 1 minute
  max: RATE_LIMIT.GENERAL_MAX || 100,
  message: 'Too many requests. Please try again later.'
});
