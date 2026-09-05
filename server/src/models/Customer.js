import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../utils/constants.js';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  drivingLicenceNumber: {
    type: String,
    trim: true,
    maxlength: [30, 'Driving licence number cannot exceed 30 characters']
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Aadhaar number cannot exceed 20 characters']
  },
  role: {
    type: String,
    default: 'customer',
    immutable: true
  },
  profileImage: {
    url: String,
    publicId: String
  },
  documents: {
    aadhaar: {
      front: { url: String, publicId: String },
      back: { url: String, publicId: String },
      verified: { type: Boolean, default: false }
    },
    license: {
      front: { url: String, publicId: String },
      back: { url: String, publicId: String },
      verified: { type: Boolean, default: false }
    }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });

customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
