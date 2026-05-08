const Bull = require('bull');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const emailQueue = new Bull('email', redisUrl);
const cleanupQueue = new Bull('cleanup', redisUrl);
const notificationQueue = new Bull('notification', redisUrl);
const analyticsQueue = new Bull('analytics', redisUrl);

emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'booking_confirmation':
      logger.info(`[JOB] Sending booking confirmation for ${data.bookingId}`);
      break;
    case 'reminder':
      logger.info(`[JOB] Sending reminder for ${data.bookingId}`);
      break;
    case 'cancellation':
      logger.info(`[JOB] Sending cancellation notice for ${data.bookingId}`);
      break;
    case 'newsletter':
      logger.info(`[JOB] Sending newsletter to ${data.emails?.length} subscribers`);
      break;
  }
  
  return { sent: true };
});

cleanupQueue.process(async (job) => {
  const { type } = job.data;
  
  switch (type) {
    case 'expire_bookings':
      logger.info('[JOB] Running expired bookings cleanup');
      break;
    case 'cleanup_uploads':
      logger.info('[JOB] Cleaning up old uploads');
      break;
    case 'cleanup_sessions':
      logger.info('[JOB] Cleaning up expired sessions');
      break;
  }
  
  return { cleaned: true };
});

notificationQueue.process(async (job) => {
  const { type, userId, title, message } = job.data;
  logger.info(`[JOB] Sending notification to ${userId}: ${title}`);
  return { sent: true };
});

analyticsQueue.process(async (job) => {
  const { type, date } = job.data;
  logger.info(`[JOB] Processing analytics for ${date}`);
  return { processed: true };
});

const scheduleEmail = (type, data, delay = 0) => {
  return emailQueue.add(type, data, { delay, attempts: 3 });
};

const scheduleCleanup = (type, data, schedule) => {
  return cleanupQueue.add(type, data, { repeat: { every: schedule } });
};

const scheduleNotification = (type, data) => {
  return notificationQueue.add(type, data, { attempts: 3 });
};

const queueMetrics = async () => {
  const [email, cleanup, notification, analytics] = await Promise.all([
    emailQueue.getJobCounts(),
    cleanupQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
    analyticsQueue.getJobCounts()
  ]);
  
  return { email, cleanup, notification, analytics };
};

emailQueue.on('failed', (job, err) => {
  logger.error(`[JOB] Email job failed: ${err.message}`);
});

cleanupQueue.on('failed', (job, err) => {
  logger.error(`[JOB] Cleanup job failed: ${err.message}`);
});

scheduleCleanup('expire_bookings', { type: 'expire_bookings' }, 15 * 60 * 1000);
scheduleCleanup('cleanup_uploads', { type: 'cleanup_uploads' }, 60 * 60 * 1000);

module.exports = {
  emailQueue,
  cleanupQueue,
  notificationQueue,
  analyticsQueue,
  scheduleEmail,
  scheduleCleanup,
  scheduleNotification,
  queueMetrics
};