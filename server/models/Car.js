const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: [true, 'Car must have a make'], trim: true },
    model: { type: String, required: [true, 'Car must have a model'], trim: true },
    year: { type: Number, required: [true, 'Car must have a year'] },
    category: { 
      type: String, 
      enum: ['sedan', 'suv', 'luxury', 'sports', 'van', 'bike'], 
      required: true 
    },
    transmission: { 
      type: String, 
      enum: ['Automatic', 'Manual'], 
      required: true 
    },
    seats: { type: Number, required: true },
    fuelType: { 
      type: String, 
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric'], 
      required: true 
    },
    driveOption: { 
      type: String, 
      enum: ['Self Drive', 'With Driver', 'Both'], 
      default: 'Self Drive' 
    },
    securityDeposit: { type: Number, default: 0 },
    pricePerDay: { type: Number, required: [true, 'Car must have a daily price'] },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    images: [{
      url: String,
      publicId: String
    }],
    licensePlate: { type: String, trim: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    totalBookings: { type: Number, default: 0 },
    description: { type: String, trim: true },
    location: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    unavailableDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  { timestamps: true }
);

carSchema.index({ isDeleted: 1, isActive: 1 });
carSchema.index({ category: 1 });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model('Car', carSchema);