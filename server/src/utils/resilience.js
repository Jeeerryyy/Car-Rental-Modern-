import { createCircuitBreaker, executeWithCircuit } from './circuitBreaker.js';
import { logger } from './logger.js';

// Circuit breaker for SMTP email sends
export const emailBreaker = createCircuitBreaker(
  async (sendMailFn, mailOptions) => {
    return await sendMailFn(mailOptions);
  },
  'SMTP Email Service',
  {
    timeout: 8000,               // 8s timeout
    errorThresholdPercentage: 50, // Open if 50% fail
    resetTimeout: 15000          // 15s reset cooldown
  }
);

// Circuit breaker for Razorpay payment gateways
export const paymentBreaker = createCircuitBreaker(
  async (paymentFn, ...args) => {
    return await paymentFn(...args);
  },
  'Razorpay Payment Gateway',
  {
    timeout: 10000,              // 10s timeout
    errorThresholdPercentage: 40, // Open if 40% fail
    resetTimeout: 20000          // 20s reset cooldown
  }
);

// Circuit breaker for Google Sheets backup synchronization
export const googleSheetsBreaker = createCircuitBreaker(
  async (syncFn, ...args) => {
    return await syncFn(...args);
  },
  'Google Sheets Backup Service',
  {
    timeout: 15000,              // 15s timeout
    errorThresholdPercentage: 60, // Open if 60% fail
    resetTimeout: 30000          // 30s reset cooldown
  }
);

export default {
  emailBreaker,
  paymentBreaker,
  googleSheetsBreaker,
  executeWithCircuit
};
