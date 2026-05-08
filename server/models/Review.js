const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  car: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Car', 
    required: true 
  },
  booking: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  ownerReply: {
    text: String,
    createdAt: Date
  },
  rejectionReason: String
}, { timestamps: true });

reviewSchema.index({ car: 1, status: 1 });
reviewSchema.index({ customer: 1 });

module.exports = mongoose.model('Review', reviewSchema);