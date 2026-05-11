import mongoose from 'mongoose';
import 'dotenv/config';
import Owner from './src/models/Owner.js';
import Customer from './src/models/Customer.js';
import Car from './src/models/Car.js';
import Booking from './src/models/Booking.js';
import Review from './src/models/Review.js';

const MONGODB_URI = process.env.MONGO_URI;

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Seed script cannot be run in production environment.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Owner.deleteMany({});
    await Customer.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Database cleared');

    // Create the single owner
    const owner = await Owner.create({
      name: 'Modern Drive Admin',
      email: 'admin@moderndrive.in',
      password: 'Password123!',
      phone: '9876543210',
      businessName: 'Modern Selfdrive',
      isActive: true,
      emailVerified: true
    });
    console.log('Owner created:', owner.email);

    // Create 8 realistic cars
    const carsData = [
      {
        make: 'Mahindra',
        model: 'Thar',
        year: 2023,
        type: 'SUV',
        category: 'suv',
        transmission: 'Automatic',
        fuelType: 'Diesel',
        seats: 4,
        pricePerDay: 4500,
        pricePerHour: 450,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['4x4', 'Bluetooth', 'Backup Camera', 'Convertible Top'],
        description: 'Experience the ultimate off-road adventure with the Mahindra Thar. Perfect for weekend getaways and exploring rough terrains around Junagadh.',
        licensePlate: 'GJ11XX1234',
        images: [{ url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', publicId: 'thar_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Toyota',
        model: 'Innova Crysta',
        year: 2022,
        type: 'SUV',
        category: 'suv',
        transmission: 'Manual',
        fuelType: 'Diesel',
        seats: 7,
        pricePerDay: 3500,
        pricePerHour: 350,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['AC', 'Airbags', 'Music System', 'Spacious Legroom'],
        description: 'The ultimate family car. Spacious, comfortable, and highly reliable for long trips.',
        licensePlate: 'GJ11YY5678',
        images: [{ url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800', publicId: 'innova_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Hyundai',
        model: 'Creta',
        year: 2023,
        type: 'SUV',
        category: 'suv',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        pricePerDay: 3000,
        pricePerHour: 300,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['Sunroof', 'Touchscreen Navigation', 'Cruise Control'],
        description: 'A premium compact SUV with loaded features and a very smooth automatic transmission.',
        licensePlate: 'GJ11ZZ9012',
        images: [{ url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', publicId: 'creta_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Maruti Suzuki',
        model: 'Swift',
        year: 2022,
        type: 'Hatchback',
        category: 'sedan',
        transmission: 'Manual',
        fuelType: 'Petrol',
        seats: 5,
        pricePerDay: 1800,
        pricePerHour: 180,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['High Mileage', 'Compact', 'AC', 'Bluetooth'],
        description: 'Perfect for city driving. Highly maneuverable, great fuel economy, and zippy performance.',
        licensePlate: 'GJ11AA1111',
        images: [{ url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', publicId: 'swift_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Honda',
        model: 'City',
        year: 2021,
        type: 'Sedan',
        category: 'sedan',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        pricePerDay: 2500,
        pricePerHour: 250,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['Premium Audio', 'Spacious Trunk', 'Comfortable Ride'],
        description: 'The standard for premium sedans. Extremely comfortable ride for business or leisure.',
        licensePlate: 'GJ11BB2222',
        images: [{ url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', publicId: 'city_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Kia',
        model: 'Seltos',
        year: 2023,
        type: 'SUV',
        category: 'suv',
        transmission: 'Automatic',
        fuelType: 'Diesel',
        seats: 5,
        pricePerDay: 3200,
        pricePerHour: 320,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['Ventilated Seats', 'Bose Speakers', 'Heads-up Display'],
        description: 'Modern, feature-packed, and stylish. The Kia Seltos turns heads wherever it goes.',
        licensePlate: 'GJ11CC3333',
        images: [{ url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', publicId: 'seltos_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Tata',
        model: 'Nexon EV',
        year: 2023,
        type: 'SUV',
        category: 'suv',
        transmission: 'Automatic',
        fuelType: 'Electric',
        seats: 5,
        pricePerDay: 2800,
        pricePerHour: 280,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['Zero Emissions', 'Fast Charging', 'Silent Cabin'],
        description: 'Experience the future of driving. No engine noise, zero tailpipe emissions, and instant torque.',
        licensePlate: 'GJ11DD4444',
        images: [{ url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', publicId: 'nexon_seed' }],
        owner: owner._id,
        isActive: true
      },
      {
        make: 'Mahindra',
        model: 'Scorpio-N',
        year: 2024,
        type: 'SUV',
        category: 'suv',
        transmission: 'Manual',
        fuelType: 'Diesel',
        seats: 7,
        pricePerDay: 4000,
        pricePerHour: 400,
        location: 'Main Office, Junagadh, Gujarat, 362001',
        features: ['Sunroof', '4x4', 'Captain Seats'],
        description: 'The Big Daddy of SUVs. Imposing road presence and exceptionally comfortable for large groups.',
        licensePlate: 'GJ11EE5555',
        images: [{ url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800', publicId: 'scorpio_seed' }],
        owner: owner._id,
        isActive: true
      }
    ];

    await Car.insertMany(carsData);
    console.log('8 cars seeded successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
