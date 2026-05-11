import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const ownerCount = await mongoose.connection.db.collection('owners').countDocuments();
    const carCount = await mongoose.connection.db.collection('cars').countDocuments();
    const bookingCount = await mongoose.connection.db.collection('bookings').countDocuments();
    const customerCount = await mongoose.connection.db.collection('customers').countDocuments();

    console.log(`Owners: ${ownerCount}`);
    console.log(`Cars: ${carCount}`);
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Customers: ${customerCount}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCounts();
