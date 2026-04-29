const crypto = require('crypto');

const sanitizeInput = (input) => {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return input.replace(/[\$\.]/g, '');
  }
  if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }
    const sanitized = {};
    for (const key of Object.keys(input)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

const generateRequestId = () => crypto.randomUUID();

const requestIdMiddleware = (req, res, next) => {
  const id = req.headers['x-request-id'] || generateRequestId();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

const trustProxyMiddleware = (req, res, next) => {
  req.ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.headers['x-real-ip'] 
    || req.connection?.remoteAddress 
    || req.socket?.remoteAddress 
    || '127.0.0.1';
  next();
};

module.exports = {
  sanitizeInput,
  generateRequestId,
  requestIdMiddleware,
  trustProxyMiddleware
};