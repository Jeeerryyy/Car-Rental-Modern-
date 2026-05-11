import { Router } from 'express';
import { handleWebhook } from '../../services/payment.service.js';
import Booking from '../../models/Booking.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';

const router = Router();

router.post('/razorpay', catchAsync(async (req, res) => {
  const { event, payload } = req.body;
  const result = await handleWebhook(event, payload);

  if (event === 'payment.captured') {
    const booking = await Booking.findOne({ razorpayOrderId: payload.payload.payment.entity.order_id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
    }
  }

  return ApiResponse.success(res, 200, 'Webhook processed', result);
}));

export default router;
