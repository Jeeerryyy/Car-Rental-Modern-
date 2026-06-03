import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Customer from '../models/Customer.js';
import { syncToGoogleSheet } from '../services/googleSheet.service.js';
import { logger } from '../utils/logger.js';

export const initBackupJob = () => {
  // Run every night at 03:00 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('[BackupJob] Starting daily Google Sheets backup...');
    
    try {
      // 1. Fetch all bookings with relations using cursor to prevent memory spikes
      const bookingData = [];
      const bookingCursor = Booking.find()
        .populate('car', 'make model registrationNumber fuelType')
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .lean()
        .cursor({ batchSize: 200 });

      for (let doc = await bookingCursor.next(); doc != null; doc = await bookingCursor.next()) {
        bookingData.push({
          'Booking ID': doc._id.toString(),
          'Date': new Date(doc.createdAt).toLocaleDateString('en-IN'),
          'Customer Name': doc.customer?.name || 'N/A',
          'Customer Phone': doc.customer?.phone || 'N/A',
          'Car Model': doc.car ? `${doc.car.make} ${doc.car.model}` : 'N/A',
          'Reg Number': doc.car?.registrationNumber || 'N/A',
          'Start Date': new Date(doc.startDate).toLocaleDateString('en-IN'),
          'End Date': new Date(doc.endDate).toLocaleDateString('en-IN'),
          'Total Price': doc.totalPrice,
          'Status': doc.status,
          'Payment': doc.paymentStatus
        });
      }

      // 2. Fetch all cars using cursor to prevent memory spikes
      const carData = [];
      const carCursor = Car.find({ isDeleted: false })
        .lean()
        .cursor({ batchSize: 200 });

      for (let doc = await carCursor.next(); doc != null; doc = await carCursor.next()) {
        carData.push({
          'ID': doc._id.toString(),
          'Make': doc.make,
          'Model': doc.model,
          'Year': doc.year,
          'Reg Number': doc.registrationNumber,
          'Fuel': doc.fuelType,
          'Price/Day': doc.pricePerDay,
          'Status': doc.isActive ? 'Active' : 'Inactive'
        });
      }

      // 3. Sync to Google Sheets (Different tabs)
      await syncToGoogleSheet('Backup_Bookings', bookingData);
      await syncToGoogleSheet('Backup_Fleet', carData);

      logger.info('[BackupJob] Daily backup completed successfully.');
    } catch (error) {
      logger.error(`[BackupJob] Backup failed: ${error.message}`);
    }
  });

  logger.info('[BackupJob] Daily backup scheduler initialized.');
};
