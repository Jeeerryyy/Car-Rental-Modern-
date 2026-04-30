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
  pricePerDay: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Rented', 'Maintenance'], default: 'Available' },
  images: [{ type: String }],
  licensePlate: { type: String, required: true, unique: true },
  rating: { type: Number, default: 0 },
  features: [{ type: String }]
}, { timestamps: true });

// indexes for filter + sort query patterns
carSchema.index({ status: 1 });
carSchema.index({ category: 1 });
carSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model('Car', carSchema);
