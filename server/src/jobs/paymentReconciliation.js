import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

/**
 * Payment Reconciliation Job
 * 
 * Runs every 30 minutes to reconcile orphaned bookings:
 * 1. Finds bookings stuck in 'pending' status with a razorpayOrderId older than 30 minutes.
 * 2. Marks them as 'cancelled' if payment was never completed (Razorpay order expired).
 * 
 * This prevents ghost bookings from blocking car availability indefinitely.
 */
export const initPaymentReconciliation = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('[ReconciliationJob] Starting payment reconciliation...');

    try {
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

      // Find bookings that are still pending and were created more than 15 minutes ago
      const staleBookings = await Booking.find({
        status: BOOKING_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
        razorpayOrderId: { $exists: true, $ne: null },
        createdAt: { $lt: fifteenMinutesAgo }
      }).limit(100).lean(); // Process in batches to avoid overwhelming the DB

      if (staleBookings.length === 0) {
        logger.info('[ReconciliationJob] No stale bookings found.');
        return;
      }

      logger.info(`[ReconciliationJob] Found ${staleBookings.length} stale pending bookings.`);

      let expiredCount = 0;
      for (const booking of staleBookings) {
        try {
          await Booking.updateOne({ _id: booking._id }, {
            $set: {
              status: BOOKING_STATUS.CANCELLED,
              paymentStatus: PAYMENT_STATUS.PENDING,
              cancellationReason: 'payment_issue',
              cancellationNote: 'Auto-cancelled: payment not completed within 15 minutes',
              cancelledBy: null
            }
          });
          expiredCount++;
          logger.info(`[ReconciliationJob] Auto-cancelled booking ${booking._id} (order: ${booking.razorpayOrderId})`);
        } catch (err) {
          logger.error(`[ReconciliationJob] Failed to cancel booking ${booking._id}: ${err.message}`);
        }
      }

      logger.info(`[ReconciliationJob] Completed: ${expiredCount}/${staleBookings.length} bookings auto-cancelled.`);
    } catch (error) {
      logger.error(`[ReconciliationJob] Job failed: ${error.message}`);
    }
  });

  logger.info('[ReconciliationJob] Payment reconciliation scheduler initialized (every 30 minutes).');
};

export default initPaymentReconciliation;
