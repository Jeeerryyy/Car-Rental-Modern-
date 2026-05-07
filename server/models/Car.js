/**
 * Car Model - Vehicle fleet inventory
 * @module models/Car
 */

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'], required: true },
  transmission: { type: String, enum: ['Automatic', 'Manual'], required: true },
  seats: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric'], required: true },
  driveOption: { type: String, enum: ['Self Drive', 'With Driver', 'Both'], default: 'Self Drive' },
  securityDeposit: { type: Number, default: 0 },
  pricePerHour: { type: Number, required: true, default: 100 },
  pricePerDay: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Rented', 'Maintenance'], default: 'Available' },
  images: [{ type: String }],
  licensePlate: { type: String, required: true, unique: true },
  rating: { type: Number, default: 0 },
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

carSchema.index({ status: 1 });
carSchema.index({ category: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ licensePlate: 1 });
carSchema.index({ isPopular: 1, status: 1 });
carSchema.index({ isFeatured: 1, status: 1 });
carSchema.index({ rating: -1 });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Car', carSchema);
