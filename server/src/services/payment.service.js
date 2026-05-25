import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const createOrder = async (amount, currency, receipt) => {
  if (!config.payment.enabled) {
    return {
      id: `mock_order_${Date.now()}`,
      amount,
      currency,
      receipt,
      status: 'created'
    };
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt
    });
    return order;
  } catch (error) {
    logger.error('Razorpay order creation failed:', error);
    const detailedError = error.error?.description || error.description || error.message || (typeof error === 'object' ? JSON.stringify(error) : error);
    throw new AppError(`Failed to create payment order: ${detailedError}`, 500);
  }
};

export const verifySignature = (orderId, paymentId, signature) => {
  if (!config.payment.enabled) {
    return true; // Auto-verify mocks
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.payment.secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

export const handleWebhook = async (event, payload) => {
  switch (event) {
    case 'payment.captured':
      return { event: 'payment.captured', status: 'processed' };
    case 'payment.failed':
      return { event: 'payment.failed', status: 'failed' };
    default:
      return { event, status: 'unhandled' };
  }
};

export const verifyWebhookSignature = (payload, signature) => {
  if (!config.payment.enabled) return true;

  const expectedSignature = crypto
    .createHmac('sha256', config.payment.secret) // Assumes same secret or a dedicated webhookSecret if added to env
    .update(JSON.stringify(payload))
    .digest('hex');

  return expectedSignature === signature;
};
