import cacheService from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Middleware to enforce request idempotency.
 * Expects 'Idempotency-Key' header on mutating endpoints.
 */
export const idempotencyMiddleware = async (req, res, next) => {
  // Only apply idempotency to POST/PUT/PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const key = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  if (!key) {
    return next();
  }

  // Validate key format (must be alphanumeric/uuid-like and between 8 and 64 characters)
  if (!/^[a-z0-9-]{8,64}$/i.test(key)) {
    logger.warn(`[Idempotency] Rejected invalid key format: "${key}"`);
    return ApiResponse.error(res, 400, 'Invalid Idempotency-Key format');
  }

  const cacheKey = `idempotency:${req.method}:${req.originalUrl}:${key}`;

  try {
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      if (cached.status === 'processing') {
        logger.warn(`[Idempotency] Duplicate request detected. Key is currently lock-held: ${key}`);
        return ApiResponse.error(res, 409, 'A request with this idempotency key is already in progress.');
      }

      logger.info(`[Idempotency] Serving cached response for key: ${key}`);
      res.status(cached.statusCode);
      
      if (cached.headers) {
        Object.entries(cached.headers).forEach(([hKey, hVal]) => {
          res.setHeader(hKey, hVal);
        });
      }
      
      // Inject idempotency execution verification headers
      res.setHeader('x-cache-lookup', 'HIT');
      res.setHeader('x-idempotent-replayed', 'true');
      
      return res.send(cached.body);
    }

    // Set temporary lock state (expires in 5 minutes if request crashes completely without releasing)
    await cacheService.set(cacheKey, { status: 'processing' }, 300);

    // Capture original send function to intercept response payload
    const rawSend = res.send;
    res.send = function (body) {
      // Only cache success and client error responses (don't cache temporary 5xx infrastructure failure states)
      if (res.statusCode < 500) {
        const payloadToCache = {
          status: 'completed',
          statusCode: res.statusCode,
          headers: {
            'content-type': res.get('content-type')
          },
          body: typeof body === 'object' ? JSON.stringify(body) : body
        };

        // Cache completed response for 24 hours (86400 seconds)
        cacheService.set(cacheKey, payloadToCache, 86400).catch((err) => {
          logger.error(`[Idempotency] Failed to store result for key ${key}:`, err);
        });
      } else {
        // If it's a 5xx error, clear the lock entirely to let clients safely retry
        cacheService.del(cacheKey).catch((err) => {
          logger.error(`[Idempotency] Failed to clear lock key ${key}:`, err);
        });
      }

      return rawSend.apply(res, arguments);
    };

    next();
  } catch (error) {
    logger.error(`[Idempotency] Middleware operational failure:`, error);
    next(error);
  }
};

export default idempotencyMiddleware;
