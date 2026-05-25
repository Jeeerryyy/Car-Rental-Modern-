import { Router } from 'express';
import { logger } from '../../utils/logger.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.post('/report', (req, res) => {
  const { type, error, componentStack, vitals, route } = req.body;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (type === 'error') {
    logger.error(`[Frontend Telemetry] Crash on route "${route || 'unknown'}": ${error || 'No message'}`, {
      componentStack,
      userAgent,
      ip,
      route
    });
  } else if (type === 'vital') {
    logger.info(`[Frontend Telemetry] Web Vitals on route "${route || 'unknown'}":`, {
      vitals,
      userAgent,
      ip,
      route
    });
  } else if (type === 'hydration') {
    logger.warn(`[Frontend Telemetry] Hydration mismatch on route "${route || 'unknown'}": ${error || 'Mismatch details'}`, {
      userAgent,
      ip,
      route
    });
  } else {
    logger.debug(`[Frontend Telemetry] Debug trace on route "${route || 'unknown'}":`, {
      body: req.body,
      userAgent,
      ip
    });
  }

  return ApiResponse.success(res, 200, 'Telemetry report received');
});

export default router;
