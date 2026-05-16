import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import Owner from './src/models/Owner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const resetPassword = async () => {
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

    const newPassword = 'Modern@Drive2026';
    // The pre-save hook in Owner.js will hash this
    owner.password = newPassword;
    await owner.save();

    console.log(`Password for ${email} has been reset to: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword();
