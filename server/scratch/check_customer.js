import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = mongoose.model('Booking', new mongoose.Schema({
  customer: mongoose.Schema.Types.ObjectId,
  car: mongoose.Schema.Types.ObjectId
}));

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const booking = await Booking.findOne();
  console.log('Booking Customer ID:', booking.customer);
  await mongoose.disconnect();
}

check();
