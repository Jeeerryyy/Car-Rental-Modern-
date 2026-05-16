import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Booking from '../src/models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const bookingsWithSignature = await Booking.find({ 'signature.url': { $exists: true, $ne: null } }).sort({ createdAt: -1 }).limit(5);
    
    if (bookingsWithSignature.length === 0) {
      console.log('No bookings with signatures found. Checking last 5 bookings regardless:');
      const lastBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
      console.log(JSON.stringify(lastBookings, null, 2));
    } else {
      console.log(`Found ${bookingsWithSignature.length} bookings with signatures:`);
      console.log(JSON.stringify(bookingsWithSignature, null, 2));
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkBooking();
