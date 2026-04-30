const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  pickupDate: { type: Date, required: true },
  dropoffDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Card', 'UPI', 'Cash', 'NetBanking'], default: 'Card' },
  gstInvoiceNumber: { type: String },
  driverRequired: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
  confirmationNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

// indexes for user lookups, status filters, and date range queries
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ pickupDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
