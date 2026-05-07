const logger = require('../utils/logger');

const QUERY_TIMEOUT = 10000;

const dbMonitor = {
  queryTimeout: (req, res, next) => {
    req.queryStart = Date.now();
    next();
  },

  logSlowQueries: (req, res, next) => {
    const originalSend = res.send;
    const start = req.queryStart || Date.now();
    
    res.send = function(data) {
      const duration = Date.now() - start;
      
      if (duration > 3000) {
        logger.warn(`[SLOW_QUERY] ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  },

  connectionPool: (mongoose) => {
    mongoose.connection.on('connected', () => {
      logger.info('[DB] Connection pool established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`[DB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[DB] Connection disconnected');
    });
  }
};

module.exports = dbMonitor;