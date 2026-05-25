import cron from 'node-cron';
import Notification from '../models/Notification.js';
import FailedJob from '../models/FailedJob.js';
import { logger } from '../utils/logger.js';

export const initCleanupJob = () => {
  // Run every night at 04:00 AM
  cron.schedule('0 4 * * *', async () => {
    logger.info('[CleanupJob] Starting daily data retention maintenance...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // 1. Prune notifications older than 30 days
      const notificationResult = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });
      logger.info(`[CleanupJob] Pruned ${notificationResult.deletedCount} notifications older than 30 days.`);

      // 2. Prune old failed jobs from the database (DLQ) older than 30 days
      const failedJobResult = await FailedJob.deleteMany({
        failedAt: { $lt: thirtyDaysAgo }
      });
      logger.info(`[CleanupJob] Pruned ${failedJobResult.deletedCount} failed background jobs older than 30 days.`);

      logger.info('[CleanupJob] Daily maintenance completed successfully.');
    } catch (error) {
      logger.error(`[CleanupJob] Maintenance failure: ${error.message}`);
    }
  });

  logger.info('[CleanupJob] Daily maintenance scheduler initialized.');
};

export default initCleanupJob;
