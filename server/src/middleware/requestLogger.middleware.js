import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Log request arrival
  logger.debug(`Incoming: ${method} ${originalUrl} from IP: ${ip}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const size = res.get('Content-Length') || 0;

    let level = 'info';
    if (statusCode >= 500) {
      level = 'error';
    } else if (statusCode >= 400) {
      level = 'warn';
    }

    logger.log(level, `HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${size} bytes`);
  });

  next();
};

export default requestLogger;
