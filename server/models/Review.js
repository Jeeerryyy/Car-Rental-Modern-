/**
 * Review Model - Customer reviews and ratings
 * @module models/Review
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  vehicle: { type: String, trim: true },
  tripType: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  avatar: { type: String, default: null },
  featured: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
}, { timestamps: true });

reviewSchema.index({ featured: -1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ carId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);