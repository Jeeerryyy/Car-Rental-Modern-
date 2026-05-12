import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Keep-Alive Cron Job
 * Pings the server's own health endpoint every 10 minutes
 * to prevent Render free-tier from spinning down.
 */
export const initKeepAlive = () => {
  if (config.nodeEnv !== 'production') return;

  const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`;

  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const res = await fetch(`${selfUrl}/health`);
      if (res.ok) {
        logger.info(`[Keep-Alive] Ping OK — ${new Date().toISOString()}`);
      } else {
        logger.warn(`[Keep-Alive] Ping returned ${res.status}`);
      }
    } catch (err) {
      logger.error(`[Keep-Alive] Ping failed: ${err.message}`);
    }
  });

  logger.info(`[Keep-Alive] Cron job started — pinging ${selfUrl}/health every 10 minutes`);
};
