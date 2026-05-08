const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  minimumBookingAmount: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

promoSchema.index({ isActive: 1 });
promoSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Promo', promoSchema);