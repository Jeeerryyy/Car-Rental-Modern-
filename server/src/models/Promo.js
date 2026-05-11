import mongoose from 'mongoose';
import { PROMO_TYPES } from '../utils/constants.js';

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: Object.values(PROMO_TYPES),
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    required: [true, 'Max uses is required']
  },
  usedCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Limited Offer'
  },
  description: {
    type: String,
    trim: true,
    default: 'Your First Booking'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

promoSchema.index({ isActive: 1 });
promoSchema.index({ expiresAt: 1 });

const Promo = mongoose.model('Promo', promoSchema);

export default Promo;
