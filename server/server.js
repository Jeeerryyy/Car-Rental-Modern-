/**
 * Modern Selfdrive Car - Server Entry Point
 * Handles clustering for production, Express app setup, middleware configuration,
 * route registration, database connection, and graceful shutdown handling.
 * @module server
 */

// Initialize OpenTelemetry BEFORE anything else
require('./telemetry');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { sanitizeInput, requestIdMiddleware } = require('./middleware/sanitizer');
const logger = require('./utils/logger');
const { redisClient } = require('./utils/cache');
const { globalLimiter, authLimiter } = require('./utils/rateLimiter');

require('dotenv').config();

/**
 * Required environment variables for server operation.
 * MONGO_URI: MongoDB connection string
 * JWT_SECRET: Secret key for JWT token signing (minimum 32 chars)
 */
const REQUIRED_ENV = [
  'MONGO_URI', 
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    process.stderr.write(`[FATAL] Missing required environment variable: ${key}\n`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  process.stderr.write('[FATAL] JWT_SECRET must be at least 32 characters\n');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Security middleware: Strict HTTP headers, Compression, CORS, and NoSQL Injection Protection
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com", process.env.CLIENT_URL, process.env.CLIENT_URL_PROD]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false // Allow external images from Cloudinary
}));
// Explicit Permissions-Policy
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  next();
});

// Response compression (gzip/brotli)
app.use(compression());

// Request ID for tracing
app.use(requestIdMiddleware);

// NoSQL Injection Protection (Express 5 compatible — req.query is read-only)
const mongoSanitize = require('express-mongo-sanitize');
app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// Intercept requests for Winston structured logging with request ID
app.use((req, res, next) => {
  const start = Date.now();
  res.once('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip
    });
  });
  next();
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://unnarrative-elton-ptotic.ngrok-free.app',
  /https?:\/\/.*\.ngrok-free\.app$/,
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Check regex patterns
    for (const pattern of allowedOrigins) {
      if (pattern instanceof RegExp && pattern.test(origin)) return callback(null, true);
    }
    callback(new Error(`CORS: ${origin} rejected`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Request body parsing with size limits to prevent payload attacks
 */
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

/**
 * Trust proxy to correctly extract IP addresses if running behind Cloudflare/Nginx
 */
app.set('trust proxy', 1);

/**
 * Distributed Global & Auth Rate Limiting (Backed by Redis)
 */
app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * Health check endpoint for load balancers and monitoring
 */
app.get('/health', (_req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    nodeVersion: process.version
  });
});

app.get('/api/version', (_req, res) => {
  res.json({ version: '1.0.0', api: 'modern-selfdrive' });
});

/**
 * API Route Registration
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/promos', require('./routes/promos'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/event-admin', require('./routes/eventAdmin'));
app.use('/api/payments', require('./routes/payments'));

/**
 * Swagger API Documentation
 */
const { setupSwagger } = require('./swagger');
setupSwagger(app);

/**
 * Static file serving for uploaded images (cloudinary fallback)
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Production: Serve the built React frontend from ../client/dist
 * This allows cPanel to run a single Node.js process for both API and UI.
 */
if (isProduction) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  /**
   * 404 handler for undefined routes (dev only — in prod, SPA handles all routes)
   */
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });
}

/**
 * Global error handler - prevents internal stack traces from leaking in production
 */
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

/**
 * MongoDB Connection with connection pooling, Read Preferences, and event handlers
 */
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
  // Route all read operations to secondary nodes in the Replica Set, freeing the primary for writes
  readPreference: 'secondaryPreferred'
}).then(() => {
  logger.info('[DB] MongoDB connected with replica read routing');
}).catch((err) => {
  logger.error(`[DB] Connection failed: ${err.message}`);
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  logger.error(`[DB] Runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('[DB] Disconnected - attempting reconnect');
});

/**
 * Server initialization with Socket.io & Redis Adapter for horizontal scaling
 */
const httpServer = http.createServer(app);
const io = socketIo(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach Redis adapter for cross-node broadcasting in PM2 cluster (only if Redis is configured)
if (redisClient && redisClient.isOpen) {
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('[SOCKET] Redis Adapter attached for cluster scaling');
  }).catch((err) => {
    logger.warn(`[SOCKET] Redis Adapter failed, using default adapter: ${err.message}`);
  });
} else {
  logger.info('[SOCKET] No Redis — using default in-memory adapter');
}

// Make io accessible to routes
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on('join-owner-room', () => {
    socket.join('owner-dashboard');
    logger.info(`[SOCKET] Client ${socket.id} joined owner-dashboard room`);
  });

  socket.on('disconnect', () => {
    logger.info(`[SOCKET] Client ${socket.id} disconnected`);
  });
});

const server = httpServer.listen(PORT, () => {
  logger.info(`[SERVER] Listening on port ${PORT}`);
});

/**
 * Graceful shutdown handler - closes DB, Redis, and HTTP server
 * @param {string} signal - Signal name (SIGTERM/SIGINT)
 */
const shutdown = async (signal) => {
  logger.info(`[${signal}] Shutting down gracefully...`);
  
  server.close(async () => {
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        logger.info('[REDIS] Connection closed');
      }
      await mongoose.connection.close(false);
      logger.info('[DB] Connection closed');
      logger.info('[SERVER] Shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error(`[SERVER] Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });
  
  setTimeout(() => {
    logger.error('[SERVER] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
