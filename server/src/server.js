import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Phase 0: Environment & Security Hardening
import './config/env.js';
import { config } from './config/env.js';

import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import { initBookingReminders } from './jobs/bookingReminder.js';
import { initBackupJob } from './jobs/backupJob.js';
import { initKeepAlive } from './jobs/keepAlive.js';
import { initSentry } from './config/sentry.js';
import { correlationMiddleware } from './middleware/correlation.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { metricsMiddleware, getMetricsString } from './config/metrics.js';
import { cacheService } from './config/redis.js';
import { initCleanupJob } from './jobs/cleanupJob.js';
import { initPaymentReconciliation } from './jobs/paymentReconciliation.js';
import { initAnalyticsSnapshot } from './jobs/analyticsSnapshot.js';

const app = express();
app.set('trust proxy', true);
initSentry();

// Generate a CSP nonce for every request
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Trace correlation and logging middleware
app.use(correlationMiddleware);
app.use(requestLogger);
app.use(metricsMiddleware);

// Permissions-Policy header (not covered by helmet defaults)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()');
  next();
});

const httpServer = http.createServer(app);
initSocket(httpServer);

const allowedOrigins = [
  config.clientUrl, 
  config.portalUrl,
  'https://modernselfdrive.in',
  'https://www.modernselfdrive.in',
  'https://admin.modernselfdrive.in',
  'https://car-rental-modern.vercel.app',
  'https://car-rental-modern-p7uu.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].map(url => url?.replace(/\/$/, '')).filter(Boolean);

logger.info(`Allowed CORS Origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) || 
      config.nodeEnv === 'development' ||
      (config.nodeEnv === 'production' && cleanOrigin.endsWith('.vercel.app'))
    ) {
      callback(null, true);
    } else {
      logger.error(`CORS Blocked: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 1. Basic Middleware & Parsers
app.use('/api/upload', express.json({ limit: '50mb' }));
app.use('/api/upload', express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 2. Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(mongoSanitize());
app.use(xss());

// 3. Rate Limiting
app.use('/api', generalLimiter);
app.use('/api/owner/auth', authLimiter);

// 7. morgan (development only) — request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Modern Drive API',
    version: '2.0.0',
    documentation: '/api-docs'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Modern Drive API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

if (config.nodeEnv === 'development') {
  let swaggerMiddleware = null;
  app.use('/api-docs', async (req, res, next) => {
    if (!swaggerMiddleware) {
      try {
        logger.info('Lazy-loading Swagger UI...');
        const { swaggerDocs } = await import('./config/swagger.js');
        swaggerMiddleware = swaggerDocs;
      } catch (err) {
        logger.error('Failed to load Swagger UI:', err);
        return res.status(500).send('Failed to load documentation');
      }
    }
    
    let idx = 0;
    const nextHandler = (err) => {
      if (err) return next(err);
      if (idx < swaggerMiddleware.length) {
        const mw = swaggerMiddleware[idx++];
        mw(req, res, nextHandler);
      } else {
        next();
      }
    };
    nextHandler();
  });
}

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    initBookingReminders();
    initBackupJob();
    initKeepAlive();
    initCleanupJob();
    initPaymentReconciliation();
    initAnalyticsSnapshot();

    const server = httpServer.listen(config.port, '0.0.0.0', () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║  Modern Drive API Server                                 ║
║  Port: ${config.port}                                         ║
║  Mode: ${config.nodeEnv}                                        ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown (3s connection draining)...`);
      
      // Stop accepting new requests
      server.close(() => {
        logger.info('HTTP server closed. Draining active connections completed.');
      });

      // Wait 3 seconds before terminating resources
      setTimeout(async () => {
        try {
          logger.info('Closing database and cache connections...');
          await mongoose.connection.close(false);
          logger.info('Database connection closed.');
          
          const redisClient = cacheService.getClient();
          if (redisClient) {
            await redisClient.quit();
            logger.info('Redis client closed.');
          }
          
          logger.info('Graceful shutdown complete. Exiting.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      }, 3000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

startServer();

export default app;