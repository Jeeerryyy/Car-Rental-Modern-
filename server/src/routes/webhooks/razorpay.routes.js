import { Router } from 'express';
import { handleWebhook, verifyWebhookSignature } from '../../services/payment.service.js';
import Booking from '../../models/Booking.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { logger } from '../../utils/logger.js';

const router = Router();

router.post('/razorpay', catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature before processing any event
  if (!verifyWebhookSignature(req.body, signature)) {
    logger.warn('[Webhook] Razorpay signature verification failed');
    return ApiResponse.error(res, 400, 'Invalid webhook signature');
  }

  const { event, payload } = req.body;
  const result = await handleWebhook(event, payload);

  if (event === 'payment.captured') {
    const booking = await Booking.findOne({ razorpayOrderId: payload.payload.payment.entity.order_id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      logger.info(`[Webhook] Booking ${booking._id} confirmed via payment capture`);
    }
  }

  return ApiResponse.success(res, 200, 'Webhook processed', result);
}));

export default router;
