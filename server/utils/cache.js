/**
 * server/utils/cache.js
 * Redis Client Initialization & Helper Methods
 * 
 * Centralized Redis client. Fully optional — if REDIS_URL is not set or Redis
 * is unreachable, the app degrades gracefully to in-memory stores.
 */

const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;
let redisAvailable = false;

// Only attempt Redis connection if a REDIS_URL is explicitly configured
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('[REDIS] Max reconnection attempts reached. Giving up.');
          return false; // Stop reconnecting
        }
        const delay = Math.min(retries * 100, 3000);
        logger.warn(`[REDIS] Reconnecting in ${delay}ms (attempt ${retries})...`);
        return delay;
      }
    }
  });

  redisClient.on('error', (err) => logger.error(`[REDIS] Client Error: ${err.message}`));
  redisClient.on('connect', () => {
    redisAvailable = true;
    logger.info('[REDIS] Connected successfully');
  });
  redisClient.on('end', () => {
    redisAvailable = false;
    logger.warn('[REDIS] Connection closed');
  });

  redisClient.connect().catch((err) => {
    redisAvailable = false;
    logger.warn(`[REDIS] Not available — running without cache: ${err.message}`);
  });
} else {
  logger.info('[REDIS] No REDIS_URL configured — running with in-memory fallbacks');
}

/**
 * Utility to clear all cache keys matching a specific pattern.
 * @param {string} pattern - Redis key pattern (e.g., 'cars:*')
 */
const invalidateCachePattern = async (pattern) => {
  if (!redisClient || !redisAvailable) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`[REDIS] Invalidated ${keys.length} keys matching pattern: ${pattern}`);
    }
  } catch (err) {
    logger.error(`[REDIS] Failed to invalidate pattern ${pattern}: ${err.message}`);
  }
};

module.exports = {
  redisClient,
  redisAvailable,
  invalidateCachePattern
};
