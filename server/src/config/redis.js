import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';
import { config } from './env.js';

let redisClient = null;
let isRedisConnected = false;
const memoryCache = new NodeCache({ stdTTL: 300, checkperiod: 120, maxKeys: 5000 });
const memoryLocks = new Map();

// Helper to determine if we should use Redis or local fallback
const useRedis = () => isRedisConnected && redisClient;

// Connect to Redis if configured
if (config.redisUrl) {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        // Stop retrying after 5 attempts to prevent blocking memory fallback operations
        if (times > 5) {
          logger.error('[Redis] Connection attempts exhausted. Falling back permanently to in-memory store.');
          isRedisConnected = false;
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('[Redis] Connection established');
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      logger.error('[Redis] Client error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('close', () => {
      logger.warn('[Redis] Connection closed');
      isRedisConnected = false;
    });
  } catch (error) {
    logger.error('[Redis] Initialization error:', error);
  }
} else {
  logger.info('[Redis] REDIS_URL not configured. Operating with in-memory caching fallback.');
}

/**
 * Cache and locks abstraction layer supporting seamless local/distributed execution.
 */
export const cacheService = {
  async get(key) {
    if (useRedis()) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        logger.warn(`[Redis] Get failed for key ${key}, falling back to memory: ${err.message}`);
      }
    }
    const val = memoryCache.get(key);
    return val !== undefined ? val : null;
  },

  async set(key, value, expirySeconds = 600) {
    if (useRedis()) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', expirySeconds);
        return true;
      } catch (err) {
        logger.warn(`[Redis] Set failed for key ${key}: ${err.message}`);
      }
    }
    return memoryCache.set(key, value, expirySeconds);
  },

  async del(key) {
    if (useRedis()) {
      try {
        await redisClient.del(key);
        return true;
      } catch (err) {
        logger.warn(`[Redis] Del failed for key ${key}: ${err.message}`);
      }
    }
    memoryCache.del(key);
    return true;
  },

  /**
   * Delete all keys matching a glob pattern (e.g. "cars:*").
   * Uses Redis SCAN for distributed mode; iterates node-cache keys for fallback.
   */
  async delPattern(pattern) {
    if (useRedis()) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } while (cursor !== '0');
        return true;
      } catch (err) {
        logger.warn(`[Redis] delPattern failed for ${pattern}: ${err.message}`);
      }
    }
    // In-memory fallback: convert glob pattern to regex
    const regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    const regex = new RegExp(regexStr);
    const allKeys = memoryCache.keys();
    const matching = allKeys.filter(k => regex.test(k));
    if (matching.length > 0) {
      memoryCache.del(matching);
    }
    return true;
  },

  async flush() {
    if (useRedis()) {
      try {
        await redisClient.flushall();
        return true;
      } catch (err) {
        logger.warn(`[Redis] Flushall failed: ${err.message}`);
      }
    }
    memoryCache.flushAll();
    return true;
  },

  async incr(key) {
    if (useRedis()) {
      try {
        return await redisClient.incr(key);
      } catch (err) {
        logger.warn(`[Redis] Incr failed for key ${key}: ${err.message}`);
      }
    }
    const current = memoryCache.get(key) || 0;
    const nextVal = current + 1;
    memoryCache.set(key, nextVal);
    return nextVal;
  },

  async expire(key, expirySeconds) {
    if (useRedis()) {
      try {
        await redisClient.expire(key, expirySeconds);
        return true;
      } catch (err) {
        logger.warn(`[Redis] Expire failed for key ${key}: ${err.message}`);
      }
    }
    const current = memoryCache.get(key);
    if (current !== undefined) {
      memoryCache.set(key, current, expirySeconds);
      return true;
    }
    return false;
  },

  /**
   * Acquire a lock for concurrency safety.
   * @param {string} key 
   * @param {number} ttlMs - Duration of lock in milliseconds.
   * @returns {boolean} True if lock acquired, false otherwise.
   */
  async acquireLock(key, ttlMs = 5000) {
    const lockKey = `lock:${key}`;
    if (useRedis()) {
      try {
        const result = await redisClient.set(lockKey, 'locked', 'NX', 'PX', ttlMs);
        return result === 'OK';
      } catch (err) {
        logger.warn(`[Redis] Lock acquisition failed for ${key}, using memory: ${err.message}`);
      }
    }
    
    // In-memory fallback lock logic
    const now = Date.now();
    if (memoryLocks.has(lockKey)) {
      const expiry = memoryLocks.get(lockKey);
      if (now < expiry) {
        return false; // Lock is currently held
      }
    }
    memoryLocks.set(lockKey, now + ttlMs);
    return true;
  },

  /**
   * Release an acquired lock.
   * @param {string} key 
   */
  async releaseLock(key) {
    const lockKey = `lock:${key}`;
    if (useRedis()) {
      try {
        await redisClient.del(lockKey);
        return;
      } catch (err) {
        logger.warn(`[Redis] Lock release failed for ${key}: ${err.message}`);
      }
    }
    memoryLocks.delete(lockKey);
  },
  
  getClient() {
    return redisClient;
  },
  
  isConnected() {
    return isRedisConnected;
  }
};

export default cacheService;
