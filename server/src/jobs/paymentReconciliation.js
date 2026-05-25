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
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

      // Find bookings that are still pending and were created more than 30 minutes ago
      const staleBookings = await Booking.find({
        status: BOOKING_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
        razorpayOrderId: { $exists: true, $ne: null },
        createdAt: { $lt: thirtyMinutesAgo }
      }).limit(100); // Process in batches to avoid overwhelming the DB

      if (staleBookings.length === 0) {
        logger.info('[ReconciliationJob] No stale bookings found.');
        return;
      }

      logger.info(`[ReconciliationJob] Found ${staleBookings.length} stale pending bookings.`);

      let expiredCount = 0;
      for (const booking of staleBookings) {
        try {
          booking.status = BOOKING_STATUS.CANCELLED;
          booking.paymentStatus = PAYMENT_STATUS.PENDING;
          booking.cancellationReason = 'payment_issue';
          booking.cancellationNote = 'Auto-cancelled: payment not completed within 30 minutes';
          booking.cancelledBy = null; // System cancellation
          await booking.save();
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
