import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

const bookingSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: [true, 'Owner is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  phone: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return this.startDate && v > this.startDate;
      },
      message: 'End date must be strictly after start date'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0.01, 'Total price must be > 0']
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  referenceId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  promoCode: String,
  discountAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceDate: {
    type: Date
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  documents: {
    aadhaar: {
      front: { url: String, publicId: String },
      back: { url: String, publicId: String }
    },
    license: {
      front: { url: String, publicId: String },
      back: { url: String, publicId: String }
    }
  },
  signature: {
    url: String,
    publicId: String
  },
  cancellationReason: {
    type: String,
    enum: ['invalid_documents', 'vehicle_not_available', 'customer_no_show', 'payment_issue', 'other', null],
    default: null
  },
  cancellationNote: {
    type: String,
    trim: true,
    maxlength: [300, 'Cancellation note cannot exceed 300 characters']
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'owner', null],
    default: null
  },
  ownerVerification: {
    documents: [{
      url: String,
      publicId: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookingSchema.virtual('totalDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
});

bookingSchema.pre('validate', function(next) {
  if (this.isNew && this.startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Allow same-day bookings
    if (this.startDate < today) {
      this.invalidate('startDate', 'Start date cannot be in the past');
    }
  }
  next();
});

bookingSchema.index({ customer: 1 });
bookingSchema.index({ car: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Phase 2 Indexes
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1, paymentStatus: 1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
