import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
const Car = mongoose.model('Car', new mongoose.Schema({}, { strict: false }));

async function clear() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database...');

    const bookingResult = await Booking.deleteMany({});
    console.log(`Successfully deleted ${bookingResult.deletedCount} bookings.`);

    const carResult = await Car.updateMany({}, { $set: { totalBookings: 0 } });
    console.log(`Reset totalBookings for ${carResult.modifiedCount} cars.`);

    console.log('Database cleanup complete.');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

clear();
