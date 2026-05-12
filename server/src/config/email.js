import nodemailer from 'nodemailer';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let transporter = null;

// Only create the transporter if SMTP is actually configured
if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });

  transporter.verify((error) => {
    if (error) {
      logger.warn(`SMTP transporter verification failed: ${error.message}`);
    } else {
      logger.info('SMTP transporter verified successfully');
    }
  });
} else {
  logger.info('[Email] SMTP not configured — email sending is disabled');
}

export default transporter;
