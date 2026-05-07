const logger = require('../utils/logger');

const responseFormatter = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    let formatted;
    
    if (data === null || data === undefined) {
      formatted = { success: false, error: 'No data found' };
    } else if (Array.isArray(data)) {
      formatted = { success: true, data, count: data.length };
    } else if (data.success !== undefined) {
      formatted = data;
    } else {
      formatted = { success: true, data };
    }
    
    res.setHeader('X-Response-Time', Date.now() - req.startTime);
    return originalJson.call(this, formatted);
  };
  
  next();
};

const startTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

const reqId = (req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = { responseFormatter, startTimer, reqId };