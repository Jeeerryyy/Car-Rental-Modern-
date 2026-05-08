const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createRefund,
  getPaymentMethods,
  createCustomer,
  getGateway
} = require('../services/paymentService');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const logger = require('../utils/logger');
const Booking = require('../models/Booking');

router.get('/gateway', (req, res) => {
  const gateway = getGateway();
  res.json({
    success: true,
    gateway: gateway.preferred,
    available: {
      stripe: gateway.stripe,
      razorpay: gateway.razorpay
    }
  });
});

router.post('/create-intent', protect, [
  body('bookingId').notEmpty().withMessage('Booking ID required'),
  body('amount').isNumeric().withMessage('Valid amount required'),
  validate
], async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const gateway = getGateway();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    let paymentData;
    
    if (gateway.stripe) {
      paymentData = await createStripePaymentIntent(amount, 'inr', {
        bookingId,
        userId: req.user._id.toString(),
        carId: booking.carId.toString(),
        confirmationNumber: booking.confirmationNumber
      });
    } else if (gateway.razorpay) {
      paymentData = await createRazorpayOrder(amount, 'INR', {
        bookingId,
        userId: req.user._id.toString(),
        carId: booking.carId.toString(),
        confirmationNumber: booking.confirmationNumber
      });
    }

    if (!paymentData) {
      return res.status(503).json({ success: false, error: 'Payment gateway unavailable' });
    }

    booking.paymentIntentId = paymentData.id;
    await booking.save();

    res.json({
      success: true,
      paymentId: paymentData.id,
      clientSecret: paymentData.clientSecret,
      amount: paymentData.amount,
      gateway: gateway.preferred
    });
  } catch (error) {
    logger.error(`[PAYMENT] Create intent error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});

router.post('/confirm', protect, async (req, res) => {
  try {
    const { bookingId, paymentId, gateway = 'razorpay' } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.paymentStatus = 'Completed';
    booking.paymentMethod = gateway === 'stripe' ? 'Card' : 'UPI';
    booking.paymentIntentId = paymentId;
    await booking.save();

    logger.info(`[PAYMENT] Booking ${bookingId} payment confirmed via ${gateway}`);

    res.json({ success: true, booking });
  } catch (error) {
    logger.error(`[PAYMENT] Confirm error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Confirmation failed' });
  }
});

router.post('/refund', protect, async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      const refund = await createRefund(
        booking.paymentIntentId,
        amount || booking.totalPrice,
        reason,
        'razorpay'
      );

      booking.paymentStatus = 'Refunded';
      await booking.save();

      res.json({ success: true, refund });
    } else {
      res.status(400).json({ success: false, error: 'Only cancelled bookings can be refunded' });
    }
  } catch (error) {
    logger.error(`[PAYMENT] Refund error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Refund failed' });
  }
});

router.get('/methods', protect, async (req, res) => {
  try {
    const gateway = getGateway();
    
    if (!gateway.stripe) {
      return res.json({ success: true, methods: [] });
    }

    const methods = await getPaymentMethods(req.user.stripeCustomerId);
    res.json({ success: true, methods });
  } catch (error) {
    logger.error(`[PAYMENT] Get methods error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch payment methods' });
  }
});

router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event;
    
    if (stripe && endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info(`[STRIPE] Payment succeeded: ${event.data.object.id}`);
        break;
      case 'payment_intent.payment_failed':
        logger.warn(`[STRIPE] Payment failed: ${event.data.object.id}`);
        break;
      default:
        logger.info(`[STRIPE] Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`[STRIPE] Webhook error: ${error.message}`);
    res.status(400).json({ error: 'Webhook error' });
  }
});

router.post('/webhook/razorpay', express.json(), async (req, res) => {
  try {
    const { payload, razorpay_signature } = req.body;
    
    const { payload: { payment } = {} } = payload;
    
    if (payment) {
      logger.info(`[RAZORPAY] Payment webhook: ${payment.id}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`[RAZORPAY] Webhook error: ${error.message}`);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;