const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  preferredDate: { type: Date },
  notes: { type: String },
  status: { type: String, enum: ['waiting', 'contacted', 'booked', 'not_interested'], default: 'waiting' }
}, { timestamps: true });

waitlistSchema.index({ email: 1, carId: 1 });
waitlistSchema.index({ carId: 1, status: 1 });
waitlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);