const circuitBreaker = require('opossum');
const logger = require('./logger');

const createCircuitBreaker = (name, options = {}) => {
  const defaultOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 10,
  };

  const opts = { ...defaultOptions, ...options };

  const breaker = new circuitBreaker(async (...args) => {
    const fn = args[0];
    const fnArgs = args.slice(1);
    return fn(...fnArgs);
  }, opts);

  breaker.on('open', () => {
    logger.warn(`[CIRCUIT-BREAKER] ${name} - Circuit OPEN`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`[CIRCUIT-BREAKER] ${name} - Circuit HALF-OPEN (testing)`);
  });

  breaker.on('close', () => {
    logger.info(`[CIRCUIT-BREAKER] ${name} - Circuit CLOSED`);
  });

  breaker.on('fallback', (error) => {
    logger.error(`[CIRCUIT-BREAKER] ${name} - Fallback triggered: ${error.message}`);
  });

  return breaker;
};

const cloudinaryBreaker = createCircuitBreaker('cloudinary', {
  timeout: 5000,
  errorThresholdPercentage: 30,
  resetTimeout: 60000,
});

const paymentBreaker = createCircuitBreaker('payment', {
  timeout: 10000,
  errorThresholdPercentage: 20,
  resetTimeout: 60000,
});

const whatsAppBreaker = createCircuitBreaker('whatsapp', {
  timeout: 5000,
  errorThresholdPercentage: 40,
  resetTimeout: 30000,
});

const runWithBreaker = async (breaker, fn, fallback, ...args) => {
  try {
    return await breaker.fire(fn, ...args);
  } catch (error) {
    if (fallback) {
      logger.warn(`[CIRCUIT-BREAKER] Using fallback for error: ${error.message}`);
      return fallback(error);
    }
    throw error;
  }
};

module.exports = {
  createCircuitBreaker,
  cloudinaryBreaker,
  paymentBreaker,
  whatsAppBreaker,
  runWithBreaker,
};