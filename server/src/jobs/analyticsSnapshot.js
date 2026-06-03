import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { getDashboardStats } from '../services/report.service.js';

/**
 * Analytics Snapshot Job
 * 
 * Runs every 15 minutes to pre-calculate dashboard statistics
 * for all active owners. This ensures dashboard loads are always
 * served from cache rather than hitting heavy aggregation queries.
 */
export const initAnalyticsSnapshot = () => {
  // Run every 60 minutes (hourly)
  cron.schedule('0 * * * *', async () => {
    logger.info('[AnalyticsJob] Starting dashboard stats pre-calculation...');

    try {
      const Owner = (await import('../models/Owner.js')).default;
      const activeOwners = await Owner.find({ isActive: true }).select('_id').lean();

      if (activeOwners.length === 0) {
        logger.info('[AnalyticsJob] No active owners found.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const owner of activeOwners) {
        try {
          // getDashboardStats internally caches the result
          await getDashboardStats(owner._id);
          successCount++;
        } catch (err) {
          failCount++;
          logger.error(`[AnalyticsJob] Failed to pre-calculate stats for owner ${owner._id}: ${err.message}`);
        }
      }

      logger.info(`[AnalyticsJob] Completed: ${successCount} owners refreshed, ${failCount} failed.`);
    } catch (error) {
      logger.error(`[AnalyticsJob] Job failed: ${error.message}`);
    }
  });

  logger.info('[AnalyticsJob] Dashboard stats pre-calculation scheduler initialized (hourly).');
};

export default initAnalyticsSnapshot;
