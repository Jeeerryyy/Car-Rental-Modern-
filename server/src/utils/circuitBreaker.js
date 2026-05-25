import CircuitBreaker from 'opossum';
import { logger } from './logger.js';
import { AppError } from './AppError.js';

const defaultOptions = {
  timeout: 10000,               // Timeout requests after 10s
  errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
  resetTimeout: 30000          // Wait 30s before trying to close the circuit again
};

/**
 * Creates an Opossum circuit breaker for a given async action.
 * @param {Function} action - Async function to run.
 * @param {string} name - Name of the service/action (for logging).
 * @param {Object} options - Opossum options.
 * @returns {CircuitBreaker}
 */
export const createCircuitBreaker = (action, name = 'Service', options = {}) => {
  const breaker = new CircuitBreaker(action, { ...defaultOptions, ...options });

  breaker.on('open', () => {
    logger.error(`[Circuit Breaker] ${name} circuit opened. Failing fast.`);
  });

  breaker.on('halfOpen', () => {
    logger.warn(`[Circuit Breaker] ${name} circuit half-open. Testing service recovery.`);
  });

  breaker.on('close', () => {
    logger.info(`[Circuit Breaker] ${name} circuit closed. Restoring service access.`);
  });

  return breaker;
};

// Ready-to-use circuit breaker wrappers
export const executeWithCircuit = async (breaker, fallback, ...args) => {
  try {
    return await breaker.fire(...args);
  } catch (error) {
    if (breaker.opened) {
      logger.warn(`[Circuit Breaker] Fast-failing execution, returning fallback or error.`);
      if (fallback) return fallback(...args);
      throw new AppError('External service is currently unavailable. Please try again later.', 503);
    }
    throw error;
  }
};
