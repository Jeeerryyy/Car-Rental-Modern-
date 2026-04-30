const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true },
  phone:           { type: String, trim: true },
  role:            { type: String, enum: ['user', 'admin'], default: 'user' },
  licenseNumber:   { type: String, trim: true },
  aadhaarVerified: { type: Boolean, default: false },
  state:           { type: String, default: 'Gujarat' },
  membershipTier:  { type: String, enum: ['Silver', 'Gold', 'Platinum'], default: 'Silver' },
  resetOtp:        { type: String, select: false },
  resetOtpExpiry:  { type: Date,   select: false },
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
