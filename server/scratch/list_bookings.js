import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = mongoose.model('Booking', new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  status: String,
  startDate: Date,
  endDate: Date
}));

const Car = mongoose.model('Car', new mongoose.Schema({
  make: String,
  model: String
}));

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const bookings = await Booking.find().populate('car');
  console.log('--- Current Bookings ---');
  bookings.forEach(b => {
    console.log(`ID: ${b._id} | Car: ${b.car?.make} ${b.car?.model} | Status: ${b.status} | Dates: ${b.startDate.toLocaleDateString()} to ${b.endDate.toLocaleDateString()}`);
  });
  await mongoose.disconnect();
}

check();
