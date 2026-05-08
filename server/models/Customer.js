const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
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
    phone: { type: String, trim: true },
    avatar: {
      url: String,
      publicId: String
    },
    role: { type: String, default: 'customer' },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    idVerificationStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },
    idDocument: {
      url: String,
      publicId: String
    },
    idVerifiedAt: Date,
    kycRejectionReason: String
  },
  { timestamps: true }
);

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

customerSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('Customer', customerSchema);