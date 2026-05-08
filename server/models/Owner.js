const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownerSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'], 
      minlength: 8, 
      select: false
    },
    businessName: { type: String, trim: true },
    phone: { type: String, trim: true },
    profileImage: {
      url: String,
      publicId: String
    },
    role: { type: String, default: 'owner' },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    businessSettings: {
      pickupLocations: [{
        name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      }],
      workingHours: {
        monday: { open: Boolean, openTime: String, closeTime: String },
        tuesday: { open: Boolean, openTime: String, closeTime: String },
        wednesday: { open: Boolean, openTime: String, closeTime: String },
        thursday: { open: Boolean, openTime: String, closeTime: String },
        friday: { open: Boolean, openTime: String, closeTime: String },
        saturday: { open: Boolean, openTime: String, closeTime: String },
        sunday: { open: Boolean, openTime: String, closeTime: String }
      },
      requireManualApproval: { type: Boolean, default: false },
      cancellationPolicyHours: { type: Number, default: 24 },
      cancellationPolicyText: String,
      platformMessage: { type: String, maxlength: 500 },
      securityDepositDefault: { type: Number, default: 2000 }
    }
  },
  { timestamps: true }
);

ownerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

ownerSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

ownerSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('Owner', ownerSchema);