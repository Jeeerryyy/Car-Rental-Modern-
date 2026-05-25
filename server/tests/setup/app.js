/**
 * Test-only Express app instance.
 * Creates the same middleware stack as server.js but does NOT:
 *   - Call startServer() / listen()
 *   - Connect to real MongoDB
 *   - Initialize Socket.io on a real HTTP server
 *   - Start cron jobs
 *
 * Socket.io's getIO() is mocked globally so services that emit events don't crash.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import routes from '../../src/routes/index.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';
import { correlationMiddleware } from '../../src/middleware/correlation.middleware.js';
import { requestLogger } from '../../src/middleware/requestLogger.middleware.js';
import { metricsMiddleware, getMetricsString } from '../../src/config/metrics.js';
import { cacheService } from '../../src/config/redis.js';

const app = express();

// Trace correlation and logging middleware
app.use(correlationMiddleware);
app.use(requestLogger);
app.use(metricsMiddleware);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server is running' });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', async (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const redisConnected = cacheService.isConnected();
  
  const status = dbConnected && redisConnected ? 200 : 503;
  res.status(status).json({
    status: status === 200 ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbConnected ? 'UP' : 'DOWN',
      cache: redisConnected ? 'UP' : 'DOWN'
    }
  });
});

const metricsAuth = (req, res, next) => {
  if (process.env.METRICS_AUTH_ENABLED !== 'true') {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Metrics"');
    return res.status(401).send('Authentication required');
  }
  const auth = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  const expectedUser = process.env.METRICS_USERNAME || 'admin';
  const expectedPass = process.env.METRICS_PASSWORD || 'admin';
  if (user === expectedUser && pass === expectedPass) {
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Metrics"');
  return res.status(401).send('Authentication required');
};

app.get('/metrics', metricsAuth, async (req, res) => {
  try {
    const metrics = await getMetricsString();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Mount all API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
