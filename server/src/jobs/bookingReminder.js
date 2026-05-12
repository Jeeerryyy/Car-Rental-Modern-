import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';
import { BOOKING_STATUS } from '../utils/constants.js';

export const initBookingReminders = () => {
  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('[Job] Starting daily booking reminders check...');
    
    try {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const upcomingBookings = await Booking.find({
        startDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
        status: BOOKING_STATUS.CONFIRMED
      }).populate('car', 'make model').populate('customer', 'name');

      logger.info(`[Job] Found ${upcomingBookings.length} bookings for tomorrow.`);

      for (const booking of upcomingBookings) {
        await createNotification(
          booking.owner,
          'Owner',
          'BOOKING_REMINDER',
          'Upcoming Booking Tomorrow',
          `Reminder: Booking for ${booking.car.make} ${booking.car.model} by ${booking.customer.name} starts tomorrow.`,
          `/owner/bookings/${booking._id}`
        );
        logger.info(`[Job] Sent reminder for booking ${booking._id} to owner ${booking.owner}`);
      }

    } catch (error) {
      logger.error(`[Job] Booking reminder job failed: ${error.message}`);
    }
  });

  logger.info('[Job] Booking reminder scheduler initialized.');
};
