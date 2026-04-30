/**
 * Seed the reviews collection with realistic customer testimonials.
 * Usage: node scripts/seedReviews.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Review   = require('../models/Review');

const SEED_DATA = [
  {
    name: 'Rahul Mehta',
    rating: 5,
    text: 'Best self drive experience in Junagadh. The Creta was spotless and had full tank. Owner was very helpful with directions to Gir. Will definitely rent again on my next visit.',
    vehicle: 'Hyundai Creta',
    tripType: 'Gir Safari Trip',
    verified: true,
    featured: true,
  },
  {
    name: 'Priya Shah',
    rating: 5,
    text: 'Took the Thar for a Gir-Somnath weekend trip. Amazing condition, great mileage, and very reasonable rates compared to other rental services in the area. Highly recommended!',
    vehicle: 'Mahindra Thar',
    tripType: 'Weekend Getaway',
    verified: true,
    featured: true,
  },
  {
    name: 'Amit Kothari',
    rating: 5,
    text: 'Airport pickup from Keshod was on time and the driver was very professional. Clean car, no hidden charges. This is the only rental service I trust in Junagadh now.',
    vehicle: 'Maruti Dzire',
    tripType: 'Airport Transfer',
    verified: true,
    featured: true,
  },
  {
    name: 'Sneha Patel',
    rating: 4,
    text: 'Rented a Scooty Activa for 3 days to explore Girnar and the old city. Super convenient pickup near Kalwa Chowk. Fuel was almost full. Slight delay in paperwork but otherwise great.',
    vehicle: 'Honda Activa',
    tripType: 'City Exploration',
    verified: true,
    featured: true,
  },
  {
    name: 'Vikram Jadeja',
    rating: 5,
    text: 'We hired the Innova with driver for a family pilgrimage — Junagadh to Somnath to Dwarka. Driver Bharat bhai was excellent. Very safe driving on the highways. AC worked perfectly throughout.',
    vehicle: 'Toyota Innova',
    tripType: 'Pilgrimage Tour',
    verified: true,
    featured: true,
  },
  {
    name: 'Neha Trivedi',
    rating: 5,
    text: 'Second time renting from Modern Selfdrive. The Swift was in perfect shape. I love that they offer both self-drive and with-driver options. Pricing is transparent with no surprise charges at return.',
    vehicle: 'Maruti Swift',
    tripType: 'Business Travel',
    verified: true,
    featured: true,
  },
  {
    name: 'Karan Solanki',
    rating: 4,
    text: 'Good fleet selection for a city like Junagadh. Booked the Venue for a day trip to Girnar ropeway. Car was clean, insurance documents were in the glove box. Smooth process overall.',
    vehicle: 'Hyundai Venue',
    tripType: 'Day Trip',
    verified: true,
    featured: false,
  },
  {
    name: 'Divya Joshi',
    rating: 5,
    text: 'My parents visited from Mumbai and I rented the Ertiga for a week. Spacious, well-maintained, and the mileage tracking was fair. The team even delivered the car to our doorstep in Joshipura.',
    vehicle: 'Maruti Ertiga',
    tripType: 'Family Visit',
    verified: true,
    featured: false,
  },
  {
    name: 'Rajesh Gohil',
    rating: 5,
    text: 'I run a small business and need cars frequently for client visits in Saurashtra region. Modern Selfdrive gives me consistent quality every time. Their Baleno is my go-to. 10/10 service.',
    vehicle: 'Maruti Baleno',
    tripType: 'Business Travel',
    verified: true,
    featured: false,
  },
  {
    name: 'Foram Bhatt',
    rating: 4,
    text: 'First time trying self-drive rental in Gujarat. Was a bit nervous but the team explained everything clearly — insurance, fuel policy, emergency contacts. The i20 drove like a dream on the highway.',
    vehicle: 'Hyundai i20',
    tripType: 'Road Trip',
    verified: true,
    featured: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[seed] connected to MongoDB');

    const existing = await Review.countDocuments();
    if (existing > 0) {
      console.log(`[seed] ${existing} reviews already exist — skipping seed`);
      process.exit(0);
    }

    await Review.insertMany(SEED_DATA);
    console.log(`[seed] inserted ${SEED_DATA.length} reviews`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err.message);
    process.exit(1);
  }
}

seed();
