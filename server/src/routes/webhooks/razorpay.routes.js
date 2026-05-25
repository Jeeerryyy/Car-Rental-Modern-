import { Router } from 'express';
import { handleWebhook, verifyWebhookSignature } from '../../services/payment.service.js';
import Booking from '../../models/Booking.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { logger } from '../../utils/logger.js';

const router = Router();

router.post('/razorpay', catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!verifyWebhookSignature(req.body, signature)) {
    logger.warn('[Webhook] Razorpay signature verification failed');
    return ApiResponse.error(res, 400, 'Invalid webhook signature');
  }

  const { event, payload } = req.body;
  logger.info(`[Webhook] Received event: ${event}`);

  const result = await handleWebhook(event, payload);

  if (event === 'payment.captured') {
    const orderId = payload?.payload?.payment?.entity?.order_id;
    if (!orderId) {
      logger.warn('[Webhook] payment.captured event missing order_id');
      return ApiResponse.success(res, 200, 'Webhook processed (no order_id)', result);
    }

    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (!booking) {
      logger.warn(`[Webhook] No booking found for razorpay order: ${orderId}`);
      return ApiResponse.success(res, 200, 'Webhook processed (no matching booking)', result);
    }

    // Idempotency: skip if already confirmed/paid
    if (booking.paymentStatus === 'paid' && booking.status === 'confirmed') {
      logger.info(`[Webhook] Booking ${booking._id} already confirmed — skipping duplicate webhook`);
      return ApiResponse.success(res, 200, 'Webhook already processed', result);
    }

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    const paidAmount = Math.min(500, booking.totalPrice);
    booking.securityDeposit = paidAmount;
    booking.amountPaid = paidAmount;
    booking.razorpayPaymentId = payload?.payload?.payment?.entity?.id || '';
    await booking.save();
    logger.info(`[Webhook] Booking ${booking._id} confirmed via payment capture (order: ${orderId})`);
  }

  return ApiResponse.success(res, 200, 'Webhook processed', result);
}));

export default router;
