const logger = require('../utils/logger');

const csrfProtection = {
  sameSiteCookie: (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie = res.cookie || function(name, value, options = {}) {
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
        ...options
      };
      
      const cookieString = `${name}=${value}; ${Object.entries(cookieOptions)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')}`;
      
      res.setHeader('Set-Cookie', cookieString);
    };
    
    next();
  },

  csrfToken: (req, res, next) => {
    if (!req.csrfToken) {
      const crypto = require('crypto');
      req.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.setHeader('X-CSRF-Token', req.csrfToken);
    next();
  },

  validateOrigin: (req, res, next) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_PROD,
    ].filter(Boolean);

    const origin = req.headers.origin;
    
    if (!origin || allowedOrigins.includes(origin)) {
      return next();
    }

    for (const pattern of allowedOrigins) {
      if (pattern instanceof RegExp && pattern.test(origin)) {
        return next();
      }
    }

    logger.warn(`[CSRF] Rejected request from origin: ${origin}`);
    return res.status(403).json({ success: false, error: 'Invalid origin' });
  }
};

module.exports = csrfProtection;