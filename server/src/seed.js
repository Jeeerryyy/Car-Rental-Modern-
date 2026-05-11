import mongoose from 'mongoose';
import { Customer, Owner, Car, Promo, Settings } from './models/index.js';
import config from './config/index.js';

const seedData = async () => {
  try {
    await mongoose.connect(config.database.uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Customer.deleteMany({}),
      Owner.deleteMany({}),
      Car.deleteMany({}),
      Promo.deleteMany({}),
      Settings.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create demo owner
    const owner = await Owner.create({
      name: 'Admin',
      email: 'admin@modernselfdrive.in',
      phone: '+918792492717',
      password: 'admin123',
      companyName: 'Modern Selfdrive Car',
      role: 'owner',
      isActive: true,
      isApproved: true,
      permissions: {
        canManageCars: true,
        canManageBookings: true,
        canManageClients: true,
        canViewReports: true,
        canManagePromos: true,
        canManageSettings: true
      }
    });
    console.log('Created demo owner');

    // Create default settings
    await Settings.create({
      owner: owner._id,
      businessName: 'Modern Selfdrive Car',
      contactEmail: 'admin@modernselfdrive.in',
      contactPhone: '+918792492717',
      address: 'Junagadh, Gujarat',
      pickupLocations: ['Junagadh Station', 'Bus Stand', 'Office'],
      workingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '21:00', isOpen: true },
        saturday: { open: '09:00', close: '21:00', isOpen: true },
        sunday: { open: '10:00', close: '18:00', isOpen: true }
      }
    });
    console.log('Created default settings');

    // Create demo customer
    const customer = await Customer.create({
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+919999999999',
      password: 'Password123!',
      isActive: true,
      isEmailVerified: true
    });
    console.log('Created demo customer');

    // Create demo cars
    const cars = await Car.insertMany([
      {
        make: 'Maruti',
        model: 'Dzire',
        year: 2024,
        category: 'sedan',
        pricePerDay: 1500,
        description: 'A comfortable and fuel-efficient sedan, perfect for city tours and long drives.',
        location: 'Junagadh',
        owner: owner._id,
        images: [{ url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400', publicId: 'car_1' }],
        isActive: true
      },
      {
        make: 'Mahindra',
        model: 'XUV300',
        year: 2024,
        category: 'suv',
        pricePerDay: 2200,
        description: 'A powerful and stylish SUV with premium features and robust safety.',
        location: 'Junagadh',
        owner: owner._id,
        images: [{ url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400', publicId: 'car_2' }],
        isActive: true
      },
      {
        make: 'Hyundai',
        model: 'Creta',
        year: 2023,
        category: 'suv',
        pricePerDay: 2500,
        description: 'The ultimate urban SUV with advanced tech and superior comfort.',
        location: 'Junagadh',
        owner: owner._id,
        images: [{ url: 'https://images.unsplash.com/photo-1606416132922-bc4a93d6e4f3?w=400', publicId: 'car_3' }],
        isActive: true
      },
      {
        make: 'Maruti',
        model: 'Swift',
        year: 2024,
        category: 'sedan',
        pricePerDay: 1200,
        description: 'The most popular hatchback in India, known for its performance and reliability.',
        location: 'Junagadh',
        owner: owner._id,
        images: [{ url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', publicId: 'car_4' }],
        isActive: true
      },
      {
        make: 'Toyota',
        model: 'Innova Crysta',
        year: 2023,
        category: 'van',
        pricePerDay: 3500,
        description: 'Premium MPV for large groups, offering unmatched comfort and luxury.',
        location: 'Junagadh',
        owner: owner._id,
        images: [{ url: 'https://images.unsplash.com/photo-1596003906949-793800a43348?w=400', publicId: 'car_5' }],
        isActive: true
      }
    ]);
    console.log('Created demo cars');

    // Create demo promo
    await Promo.create({
      code: 'MODERN20',
      discountType: 'percentage',
      discountValue: 20,
      maxUses: 100,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    console.log('Created demo promo');

    console.log('\n✓ Seed completed successfully!\n');
    console.log('Demo Credentials:');
    console.log('  Owner: admin@modernselfdrive.in / admin123');
    console.log('  Customer: demo@example.com / Password123!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();