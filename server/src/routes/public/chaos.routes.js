import { Router } from 'express';
import { chaosState } from '../../utils/chaosState.js';
import { config } from '../../config/env.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

// Middleware to block chaos endpoints in production
router.use((req, res, next) => {
  if (config.nodeEnv === 'production') {
    return ApiResponse.error(res, 403, 'Chaos simulation is disabled in production.');
  }
  next();
});

router.get('/status', (req, res) => {
  return ApiResponse.success(res, 200, 'Chaos state retrieved', chaosState);
});

router.post('/toggle', (req, res) => {
  const { dbLatencyMs, redisOffline, paymentTimeout, emailFailure } = req.body;

  if (dbLatencyMs !== undefined) chaosState.dbLatencyMs = Number(dbLatencyMs);
  if (redisOffline !== undefined) chaosState.redisOffline = !!redisOffline;
  if (paymentTimeout !== undefined) chaosState.paymentTimeout = !!paymentTimeout;
  if (emailFailure !== undefined) chaosState.emailFailure = !!emailFailure;

  return ApiResponse.success(res, 200, 'Chaos state updated', chaosState);
});

export default router;
