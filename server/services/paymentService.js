const Stripe = require('stripe');
const crypto = require('crypto');
const logger = require('../utils/logger');

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const Razorpay = require('razorpay');
const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

const PaymentMethod = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  CASH: 'cash'
};

const createStripePaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  if (!stripe) {
    logger.warn('[PAYMENT] Stripe not configured');
    return null;
  }

  try {
    const idempotencyKey = `${metadata.bookingId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: metadata.bookingId || '',
        userId: metadata.userId || '',
        carId: metadata.carId || '',
        confirmationNumber: metadata.confirmationNumber || '',
        ...metadata
      },
      idempotency_key: idempotencyKey
    });

    logger.info(`[PAYMENT] Stripe payment intent created: ${paymentIntent.id}`);
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    };
  } catch (error) {
    logger.error(`[PAYMENT] Stripe error: ${error.message}`);
    throw error;
  }
};

const createRazorpayOrder = async (amount, currency = 'INR', metadata = {}) => {
  try {
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${metadata.bookingId || crypto.randomBytes(4).toString('hex')}`,
      notes: {
        bookingId: metadata.bookingId || '',
        userId: metadata.userId || '',
        carId: metadata.carId || '',
        confirmationNumber: metadata.confirmationNumber || ''
      }
    };

    const order = await razorpay.orders.create(options);
    logger.info(`[PAYMENT] Razorpay order created: ${order.id}`);
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    };
  } catch (error) {
    logger.error(`[PAYMENT] Razorpay error: ${error.message}`);
    throw error;
  }
};

const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn(`[PAYMENT] Invalid Razorpay signature`);
      return false;
    }

    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    logger.info(`[PAYMENT] Razorpay payment verified: ${payment.id}`);
    
    return payment.status === 'captured';
  } catch (error) {
    logger.error(`[PAYMENT] Razorpay verification error: ${error.message}`);
    return false;
  }
};

const createRefund = async (paymentIntentId, amount, reason = '', gateway = 'stripe') => {
  try {
    let refund;
    
    if (gateway === 'stripe' && stripe) {
      refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: { reason }
      });
      logger.info(`[PAYMENT] Stripe refund created: ${refund.id}`);
    } else if (gateway === 'razorpay') {
      refund = await razorpay.refunds.create({
        payment_id: paymentIntentId,
        amount: Math.round(amount * 100),
        notes: { reason }
      });
      logger.info(`[PAYMENT] Razorpay refund created: ${refund.id}`);
    }

    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  } catch (error) {
    logger.error(`[PAYMENT] Refund error: ${error.message}`);
    throw error;
  }
};

const getPaymentMethods = async (customerId, gateway = 'stripe') => {
  if (!stripe || gateway !== 'stripe') return [];
  
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    return paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year
    }));
  } catch (error) {
    logger.error(`[PAYMENT] Get payment methods error: ${error.message}`);
    return [];
  }
};

const createCustomer = async (email, name, metadata = {}) => {
  if (!stripe) return null;
  
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    logger.info(`[PAYMENT] Stripe customer created: ${customer.id}`);
    return { id: customer.id, email: customer.email };
  } catch (error) {
    logger.error(`[PAYMENT] Create customer error: ${error.message}`);
    throw error;
  }
};

const getGateway = () => {
  const preferred = process.env.PAYMENT_GATEWAY || 'razorpay';
  return {
    stripe: !!stripe,
    razorpay: !!process.env.RAZORPAY_KEY_ID,
    preferred
  };
};

module.exports = {
  stripe,
  razorpay,
  PaymentStatus,
  PaymentMethod,
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createRefund,
  getPaymentMethods,
  createCustomer,
  getGateway
};