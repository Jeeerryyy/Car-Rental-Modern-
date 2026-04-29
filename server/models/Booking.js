/**
 * Booking Model - Vehicle rental reservations
 * @module models/Booking
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  manualName: { type: String },
  manualPhone: { type: String },
  source: { type: String, enum: ['online', 'offline'], default: 'online' },
  pickupDate: { type: Date, required: true },
  dropoffDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  basePrice: { type: Number },
  discountAmount: { type: Number, default: 0 },
  promoCode: { type: String },
  securityDeposit: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['Card', 'UPI', 'Cash', 'NetBanking', 'Pending'], default: 'Pending' },
  gstInvoiceNumber: { type: String },
  driverRequired: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Upcoming', 'Completed', 'Cancelled', 'Pending'], default: 'Upcoming' },
  confirmationNumber: { type: String, required: true, unique: true },
  preRidePhotos: [{ type: String }],
  postRidePhotos: [{ type: String }],
  fuelOverageCharge: { type: Number, default: 0 },
  lateReturnPenalty: { type: Number, default: 0 },
  tollCharges: { type: Number, default: 0 },
  finalBilledAmount: { type: Number },
  signatureUrl: { type: String },
  documents: [{ type: { type: String, enum: ['Aadhaar', 'Driving License'] }, url: String }],
  receiptUrl: { type: String },
  termsAccepted: { type: Boolean, default: false }
}, { timestamps: true });

bookingSchema.index({ userId: 1 });
bookingSchema.index({ carId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ pickupDate: 1 });
bookingSchema.index({ confirmationNumber: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ source: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ pickupDate: 1, dropoffDate: 1 });
bookingSchema.index({ status: 1, pickupDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
