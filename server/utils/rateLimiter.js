/**
 * server/utils/rateLimiter.js
 * Rate Limiting Configuration
 * 
 * Uses Redis-backed stores when Redis is available for distributed enforcement
 * across PM2 cluster nodes. Falls back to in-memory stores for local development.
 */

const { rateLimit } = require('express-rate-limit');
const { redisClient } = require('./cache');
const logger = require('./logger');

let storeFactory = () => undefined;

if (redisClient) {
  try {
    const RedisStore = require('rate-limit-redis').default;
    storeFactory = (prefix) => new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: prefix || 'rl:'
    });
    logger.info('[RATE LIMIT] Using Redis-backed store');
  } catch (err) {
    logger.warn('[RATE LIMIT] rate-limit-redis not available, using in-memory store');
  }
} else {
  logger.info('[RATE LIMIT] No Redis — using in-memory store');
}

const createLimiter = (config) => rateLimit({
  windowMs: config.windowMs || 15 * 60 * 1000,
  max: config.max || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: config.message || { success: false, error: 'Too many requests' },
  store: storeFactory(config.prefix || 'rl:'),
  keyGenerator: config.keyGenerator || ((req) => req.user?._id || req.ip),
  skip: config.skip || (() => false),
  handler: (req, res, next, options) => {
    logger.warn(`[RATE LIMIT] ${config.name || 'Limit'} exceeded for: ${req.user?._id || req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
  validate: { keyGeneratorIpFallback: false }
});

module.exports = {
  createLimiter,
  globalLimiter: createLimiter({ max: 300, windowMs: 15 * 60 * 1000, prefix: 'rl:global:', name: 'global' }),
  authLimiter: createLimiter({ max: 10, windowMs: 15 * 60 * 1000, prefix: 'rl:auth:', name: 'auth' }),
  userActionLimiter: createLimiter({ max: 100, windowMs: 60 * 1000, prefix: 'rl:user:', name: 'user-action' }),
  uploadLimiter: createLimiter({ max: 20, windowMs: 60 * 60 * 1000, prefix: 'rl:upload:', name: 'upload' }),
  searchLimiter: createLimiter({ max: 60, windowMs: 60 * 1000, prefix: 'rl:search:', name: 'search' }),
  bookingLimiter: createLimiter({ max: 10, windowMs: 60 * 60 * 1000, prefix: 'rl:booking:', name: 'booking' }),
};