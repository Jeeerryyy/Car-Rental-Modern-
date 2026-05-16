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
import { swaggerDocs } from './config/swagger.js';
import { initSentry } from './config/sentry.js';

const app = express();
app.set('trust proxy', true);
initSentry();
const httpServer = http.createServer(app);
initSocket(httpServer);

const allowedOrigins = [
  config.clientUrl, 
  config.portalUrl,
  'https://modernselfdrive.in',
  'https://www.modernselfdrive.in',
  'https://admin.modernselfdrive.in',
  'https://car-rental-modern.vercel.app',
  'https://car-rental-modern-p7uu.vercel.app'
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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// 2. Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize());
app.use(xss());

// 3. Rate Limiting
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
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

if (config.nodeEnv === 'development') {
  app.use('/api-docs', swaggerDocs);
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

    const server = httpServer.listen(config.port, '0.0.0.0', () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║  Modern Drive API Server                                 ║
║  Port: ${config.port}                                         ║
║  Mode: ${config.nodeEnv}                                        ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          logger.info('Server closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          logger.info('Server closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    });

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