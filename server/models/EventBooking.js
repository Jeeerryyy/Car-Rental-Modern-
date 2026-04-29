const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  seats: [{
    row: Number,
    col: Number,
    tier: String
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  confirmationNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventBooking', eventBookingSchema);
