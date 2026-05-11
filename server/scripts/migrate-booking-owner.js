import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Booking from '../src/models/Booking.js';
import Car from '../src/models/Car.js';

const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`Starting migration... ${isDryRun ? '(DRY RUN)' : ''}`);
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    const bookings = await Booking.find({ owner: { $exists: false } }).populate('car');
    console.log(`Found ${bookings.length} bookings needing migration.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      if (!booking.car || !booking.car.owner) {
        console.warn(`Booking ${booking._id} has no valid car or car owner. Skipping.`);
        errorCount++;
        continue;
      }

      const ownerId = booking.car.owner;

      if (!isDryRun) {
        // Need to bypass validation just for this update to avoid triggering new validation logic on old data
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { owner: ownerId } }
        );
      }
      
      console.log(`[${isDryRun ? 'DRY RUN' : 'UPDATED'}] Booking ${booking._id} set owner: ${ownerId}`);
      updatedCount++;
    }

    console.log(`\nMigration completed.`);
    console.log(`Successfully processed: ${updatedCount}`);
    console.log(`Errors/Skipped: ${errorCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  }
}

migrate();
