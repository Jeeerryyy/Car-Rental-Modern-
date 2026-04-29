const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`[REQUEST] ${req.method} ${req.originalUrl} ${res.statusCode}`, logData);
    } else {
      logger.info(`[REQUEST] ${req.method} ${req.originalUrl} ${res.statusCode}`, logData);
    }
  });
  
  next();
};

module.exports = requestLogger;