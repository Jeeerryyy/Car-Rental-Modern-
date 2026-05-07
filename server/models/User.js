/**
 * User Model - Customer and admin accounts
 * @module models/User
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  licenseNumber: { type: String, trim: true },
  kyc: { drivingLicenseUrl: { type: String }, status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' } },
  termsAccepted: { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: false },
  state: { type: String, default: 'Gujarat' },
  membershipTier: { type: String, enum: ['Silver', 'Gold', 'Platinum'], default: 'Silver' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  resetOtp: { type: String, select: false },
  resetOtpExpiry: { type: Date, select: false },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ membershipTier: 1 });

module.exports = mongoose.model('User', userSchema);
