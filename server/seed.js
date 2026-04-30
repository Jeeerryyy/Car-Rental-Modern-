require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');

const seedCars = [
  {
    make: 'Maruti Suzuki',
    model: 'Swift',
    year: 2023,
    category: 'Hatchback',
    transmission: 'Manual',
    seats: 5,
    fuelType: 'Petrol',
    driveOption: 'Self Drive',
    securityDeposit: 2000,
    pricePerDay: 1200,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-AA-1234',
    features: ['AC', 'Bluetooth', 'Power Steering']
  },
  {
    make: 'Hyundai',
    model: 'Grand i10 Nios',
    year: 2022,
    category: 'Hatchback',
    transmission: 'Manual',
    seats: 5,
    fuelType: 'Petrol',
    driveOption: 'Self Drive',
    securityDeposit: 2000,
    pricePerDay: 1100,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-BB-5678',
    features: ['AC', 'Bluetooth', 'Touchscreen']
  },
  {
    make: 'Honda',
    model: 'City',
    year: 2023,
    category: 'Sedan',
    transmission: 'Manual',
    seats: 5,
    fuelType: 'Petrol',
    driveOption: 'Both',
    securityDeposit: 3000,
    pricePerDay: 1800,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1503376760356-a0a688ddb435?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-CC-9012',
    features: ['AC', 'Sunroof', 'Leather Seats', 'Reverse Camera']
  },
  {
    make: 'Hyundai',
    model: 'Verna',
    year: 2022,
    category: 'Sedan',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Petrol',
    driveOption: 'Both',
    securityDeposit: 3000,
    pricePerDay: 2000,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1503376760356-a0a688ddb435?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-DD-3456',
    features: ['AC', 'Ventilated Seats', 'Touchscreen', 'ADAS']
  },
  {
    make: 'Mahindra',
    model: 'Thar',
    year: 2023,
    category: 'SUV',
    transmission: 'Manual',
    seats: 4,
    fuelType: 'Diesel',
    driveOption: 'Self Drive',
    securityDeposit: 5000,
    pricePerDay: 3500,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-EE-7890',
    features: ['4x4', 'Hard Top', 'Offroad Tyres']
  },
  {
    make: 'Mahindra',
    model: 'Scorpio-N',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    seats: 7,
    fuelType: 'Diesel',
    driveOption: 'With Driver',
    securityDeposit: 0,
    pricePerDay: 3000,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-FF-1234',
    features: ['AC', '7 Seater', 'Sunroof', 'Captain Seats']
  },
  {
    make: 'Toyota',
    model: 'Innova Crysta',
    year: 2022,
    category: 'SUV',
    transmission: 'Manual',
    seats: 7,
    fuelType: 'Diesel',
    driveOption: 'With Driver',
    securityDeposit: 0,
    pricePerDay: 4000,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-GG-5678',
    features: ['AC', 'Premium Sound', 'Spacious Boot']
  },
  {
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: 2021,
    category: 'Bike',
    transmission: 'Manual',
    seats: 2,
    fuelType: 'Petrol',
    driveOption: 'Self Drive',
    securityDeposit: 1000,
    pricePerDay: 800,
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    licensePlate: 'GJ-11-HH-9012',
    features: ['Helmet Included', 'Disk Brakes']
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/moderndrive';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding');

    await Car.deleteMany();
    console.log('Cleared existing cars');

    await Car.insertMany(seedCars);
    console.log('Added 8 Modern Selfdrive Cars');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
