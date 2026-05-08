const config = require('./config/env'); // Validates env on startup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const http = require('http');

const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { requestIdMiddleware } = require('./middleware/sanitizer');
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com", config.clientUrl, config.clientUrlProd]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: [config.clientUrl, config.clientUrlProd, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'category', 'pricePerDay', 'transmission', 'fuelType', 'driveOption', 'isPopular', 'isFeatured', 'status'
  ]
}));

app.use(compression());
app.use(requestIdMiddleware);

// Request logging
if (config.env === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Global rate limiting
app.use('/api', globalLimiter);

// --- ROUTE MOUNTING ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer/auth', require('./routes/customer/authRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/owner/settings', require('./routes/owner/settingsRoutes'));
app.use('/api/owner/promos', require('./routes/owner/promoRoutes'));
app.use('/api/owner/kyc', require('./routes/owner/kycRoutes'));
app.use('/api/owner/reports', require('./routes/owner/reportsRoutes'));
app.use('/api/owner/notifications', require('./routes/owner/notificationRoutes'));
app.use('/api/customer', require('./routes/customer/customerRoutes'));
app.use('/api/customer/kyc', require('./routes/customer/kycRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (config.env === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.sendFile(path.join(clientDist, 'index.html'));
    } else {
      next();
    }
  });
}

// 404 handler for unknown API routes
app.use('/api', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// --- DATABASE & SERVER BOOTSTRAP ---
mongoose.connect(config.db.uri, {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  logger.info('[DB] MongoDB connected securely');
}).catch((err) => {
  logger.error(`[DB] Connection failed: ${err.message}`);
  process.exit(1);
});

const httpServer = http.createServer(app);
const server = httpServer.listen(config.port, () => {
  logger.info(`[SERVER] Running in ${config.env} mode on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[SIGTERM] Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false);
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  logger.info('[SIGINT] Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false);
    process.exit(0);
  });
});
