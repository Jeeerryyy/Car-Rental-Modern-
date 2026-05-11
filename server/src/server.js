// Server Restart - Bypassing restrictions for debugging
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

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

// 1. cors({ origin: [CLIENT_URL, PORTAL_URL], credentials: true })
const allowedOrigins = [config.clientUrl, config.portalUrl].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 2. helmet() — sets all security-related HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// 3. mongoSanitize() — strips $ and . from request body/query to prevent NoSQL injection
app.use(mongoSanitize());

// 4. xss-clean — sanitizes HTML in request body
app.use(xss());

// 5. express-rate-limit
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/owner/auth', authLimiter); // Protect owner auth as well

// 6. express.json({ limit: '10kb' }) — prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// 7. morgan (development only) — request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Modern Drive API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const server = httpServer.listen(config.port, () => {
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
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info('Server closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info('Server closed');
          process.exit(0);
        });
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
