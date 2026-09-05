import mongoose from 'mongoose';
import { CAR_CATEGORIES, VEHICLE_TYPES } from '../utils/constants.js';

const unavailableDateSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return this.startDate && v > this.startDate;
      },
      message: 'End date must be strictly after start date'
    }
  },
  reason: String
});

const carSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(VEHICLE_TYPES),
    default: VEHICLE_TYPES.CAR,
    required: true
  },
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  category: {
    type: String,
    enum: CAR_CATEGORIES,
    required: [true, 'Category is required']
  },
  fuelType: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  transmission: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  unavailableDates: [unavailableDateSchema],
  totalBookings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

carSchema.pre(/^find/, function(next) {
  if (this._conditions.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

carSchema.index({ type: 1 });
carSchema.index({ category: 1 });
carSchema.index({ isActive: 1 });
carSchema.index({ isDeleted: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ owner: 1 });
carSchema.index({ owner: 1, isDeleted: 1, isActive: 1 });
carSchema.index({ isActive: 1, isDeleted: 1, category: 1 });
carSchema.index({ isActive: 1, isDeleted: 1, location: 1 });
carSchema.index({ make: 'text', model: 'text', location: 'text' });

const Car = mongoose.model('Car', carSchema);

export default Car;
