/**
 * Promo Model - Discount codes and coupons
 * @module models/Promo
 */

const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

promoSchema.index({ code: 1 });
promoSchema.index({ isActive: 1 });
promoSchema.index({ validFrom: 1, validTo: 1 });
module.exports = mongoose.model('Promo', promoSchema);
