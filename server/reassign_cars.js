import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Car from './src/models/Car.js';
import Owner from './src/models/Owner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const reassignCars = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const email = 'owner@modernselfdrive.in';
    const owner = await Owner.findOne({ email });
    
    if (!owner) {
      console.log('Owner not found');
      process.exit(1);
    }

    console.log(`Reassigning all cars to owner: ${owner.name} (${owner._id})`);
    
    const result = await Car.updateMany({}, { $set: { owner: owner._id } });
    console.log(`Successfully reassigned ${result.modifiedCount} cars.`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

reassignCars();
