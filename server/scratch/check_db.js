import mongoose from 'mongoose';
import 'dotenv/config';
import Owner from './src/models/Owner.js';
import Car from './src/models/Car.js';
import Booking from './src/models/Booking.js';
import Customer from './src/models/Customer.js';

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const owners = await Owner.countDocuments();
  const cars = await Car.countDocuments();
  const bookings = await Booking.countDocuments();
  const customers = await Customer.countDocuments();
  
  console.log({ owners, cars, bookings, customers });
  process.exit(0);
};

check();
