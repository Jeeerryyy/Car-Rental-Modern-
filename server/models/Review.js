const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  text:       { type: String, required: true, trim: true, maxlength: 500 },
  vehicle:    { type: String, trim: true },
  tripType:   { type: String, trim: true },
  verified:   { type: Boolean, default: false },
  avatar:     { type: String, default: null },
  featured:   { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
