const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    car: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Car', 
      required: [true, 'Booking must belong to a car'] 
    },
    customer: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Customer', 
      required: [true, 'Booking must belong to a customer'] 
    },
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required'] 
    },
    endDate: { 
      type: Date, 
      required: [true, 'End date is required'] 
    },
    totalDays: Number,
    basePrice: Number,
    securityDeposit: Number,
    discountAmount: { type: Number, default: 0 },
    finalTotal: Number,
    status: {
      type: String,
      enum: ['pending', 'pending_approval', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'manual_collection'],
      default: 'pending'
    },
    promoCode: String,
    priceOverride: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    invoiceUrl: String,
    rejectionReason: String,
    notes: { type: String, trim: true }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bookingSchema.virtual('totalDays').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ startDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);