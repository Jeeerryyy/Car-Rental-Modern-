const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Car = require('../models/Car');

const demoCars = [
  {
    make: 'Mahindra',
    model: 'Thar 4x4',
    year: 2023,
    category: 'SUV',
    transmission: 'Manual',
    seats: 4,
    fuelType: 'Diesel',
    driveOption: 'Self Drive',
    pricePerDay: 3500,
    pricePerHour: 200,
    status: 'Available',
    images: ['https://res.cloudinary.com/demo/image/upload/v1631234567/thar.jpg'],
    licensePlate: 'GJ-03-MT-1234',
    features: ['4WD', 'Convertible', 'Bluetooth'],
    isPopular: true
  },
  {
    make: 'Maruti Suzuki',
    model: 'Swift',
    year: 2022,
    category: 'Hatchback',
    transmission: 'Manual',
    seats: 5,
    fuelType: 'Petrol',
    driveOption: 'Self Drive',
    pricePerDay: 1800,
    pricePerHour: 100,
    status: 'Available',
    images: ['https://res.cloudinary.com/demo/image/upload/v1631234568/swift.jpg'],
    licensePlate: 'GJ-03-MS-5678',
    features: ['AC', 'Music System', 'Airbags'],
    isPopular: true
  },
  {
    make: 'Hyundai',
    model: 'Creta',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Diesel',
    driveOption: 'Both',
    pricePerDay: 3200,
    pricePerHour: 180,
    status: 'Available',
    images: ['https://res.cloudinary.com/demo/image/upload/v1631234569/creta.jpg'],
    licensePlate: 'GJ-03-HC-9012',
    features: ['Sunroof', 'Reverse Camera', 'Cruise Control'],
    isPopular: false
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Diesel',
    driveOption: 'With Driver',
    pricePerDay: 5500,
    pricePerHour: 400,
    status: 'Available',
    images: ['https://res.cloudinary.com/demo/image/upload/v1631234570/fortuner.jpg'],
    licensePlate: 'GJ-03-TF-3456',
    features: ['7-Seater', 'Powerful Engine', 'Leather Seats'],
    isPopular: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing cars
    await Car.deleteMany({});
    console.log('Cleared existing cars');

    // Insert demo cars
    await Car.insertMany(demoCars);
    console.log('Demo cars seeded successfully');

    process.exit();
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
