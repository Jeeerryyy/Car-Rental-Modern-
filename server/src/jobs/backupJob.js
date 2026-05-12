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
      // 1. Fetch all bookings with relations
      const bookings = await Booking.find()
        .populate('car', 'make model registrationNumber fuelType')
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });

      const bookingData = bookings.map(b => ({
        'Booking ID': b._id.toString(),
        'Date': new Date(b.createdAt).toLocaleDateString('en-IN'),
        'Customer Name': b.customer?.name || 'N/A',
        'Customer Phone': b.customer?.phone || 'N/A',
        'Car Model': b.car ? `${b.car.make} ${b.car.model}` : 'N/A',
        'Reg Number': b.car?.registrationNumber || 'N/A',
        'Start Date': new Date(b.startDate).toLocaleDateString('en-IN'),
        'End Date': new Date(b.endDate).toLocaleDateString('en-IN'),
        'Total Price': b.totalPrice,
        'Status': b.status,
        'Payment': b.paymentStatus
      }));

      // 2. Fetch all cars
      const cars = await Car.find({ isDeleted: false });
      const carData = cars.map(c => ({
        'ID': c._id.toString(),
        'Make': c.make,
        'Model': c.model,
        'Year': c.year,
        'Reg Number': c.registrationNumber,
        'Fuel': c.fuelType,
        'Price/Day': c.pricePerDay,
        'Status': c.isActive ? 'Active' : 'Inactive'
      }));

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
