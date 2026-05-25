import * as Sentry from '@sentry/node';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export const initSentry = () => {
  if (config.nodeEnv === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: config.nodeEnv,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration()
      ],
      beforeSend(event) {
        if (config.nodeEnv === 'development') {
          return null;
        }
        return event;
      }
    });

    logger.info('Sentry initialized for production');
  }
};

export const captureException = (error, context = {}) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

export default Sentry;