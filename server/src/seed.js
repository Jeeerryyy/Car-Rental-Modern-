import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Owner from './models/Owner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedOwner() {
  try {
    // Use the MONGO_URI from .env
    const mongoUri = process.env.MONGO_URI;

    console.log('Connecting to target database (direct) for owner seeding...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const ownerEmail = 'owner@modernselfdrive.in';
    const existingOwner = await Owner.findOne({ email: ownerEmail });

    if (existingOwner) {
      console.log(`Owner account already exists (${ownerEmail}). Keeping existing password.`);
    } else {
      console.log('Creating master owner account...');
      await Owner.create({
        name: 'Modern Drive Owner',
        email: ownerEmail,
        password: 'Modern@Drive2026',
        phone: '1234567890',
        businessName: 'Modern Selfdrive',
        role: 'owner',
        isActive: true
      });
      console.log('Master owner account created successfully!');
      console.log('Email:', ownerEmail);
      console.log('Password: Modern@Drive2026');
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedOwner();
