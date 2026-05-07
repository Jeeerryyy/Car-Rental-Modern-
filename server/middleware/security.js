const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { redisClient } = require('../utils/cache');

const requestSizeLimit = '10kb';

const securityMiddleware = {
  cors: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  }),

  noSniff: helmet.noSniff(),
  
  xssFilter: helmet.xssFilter(),
  
  ieNoOpen: helmet.ieNoOpen(),
  
  hsts: helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true
  }),
};

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
    validate: { ip: true }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' }
});

const bodyValidation = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || 0);
  const maxSize = 10 * 1024;
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Payload too large'
    });
  }
  next();
};

module.exports = {
  securityMiddleware,
  createRateLimiter,
  strictRateLimiter,
  bodyValidation,
  requestSizeLimit
};