import Promo from '../models/Promo.js';
import { AppError } from '../utils/AppError.js';
import { PROMO_TYPES } from '../utils/constants.js';

export const validatePromo = async (code, orderValue) => {
  const promo = await Promo.findOne({ code: code.toUpperCase() });

  if (!promo) {
    throw new AppError('Invalid promo code', 404);
  }

  if (!promo.isActive) {
    throw new AppError('This promo code is no longer active', 400);
  }

  if (new Date(promo.expiresAt) <= new Date()) {
    throw new AppError('This promo code has expired', 400);
  }

  if (promo.usedCount >= promo.maxUses) {
    throw new AppError('This promo code has reached its usage limit', 400);
  }

  if (orderValue < promo.minOrderValue) {
    throw new AppError(`Minimum order value of ${promo.minOrderValue} required`, 400);
  }

  let discountAmount = 0;
  if (promo.discountType === PROMO_TYPES.PERCENTAGE) {
    discountAmount = (orderValue * promo.discountValue) / 100;
  } else {
    discountAmount = promo.discountValue;
  }

  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount: Math.min(discountAmount, orderValue)
  };
};

export const createPromo = async (promoData) => {
  promoData.code = promoData.code.toUpperCase();
  
  const existingPromo = await Promo.findOne({ code: promoData.code });
  if (existingPromo) {
    throw new AppError('Promo code already exists', 400);
  }

  const promo = await Promo.create(promoData);
  return promo;
};

export const updatePromo = async (promoId, updates) => {
  const promo = await Promo.findByIdAndUpdate(
    promoId,
    updates,
    { new: true, runValidators: true }
  );

  if (!promo) {
    throw new AppError('Promo not found', 404);
  }

  return promo;
};

export const togglePromo = async (promoId) => {
  const promo = await Promo.findById(promoId);

  if (!promo) {
    throw new AppError('Promo not found', 404);
  }

  promo.isActive = !promo.isActive;
  await promo.save();

  return promo;
};

export const deletePromo = async (promoId) => {
  const promo = await Promo.findByIdAndDelete(promoId);

  if (!promo) {
    throw new AppError('Promo not found', 404);
  }

  return promo;
};

export const getAllPromos = async (ownerId, pagination = { page: 1, limit: 10 }) => {
  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Promo.countDocuments();

  const promos = await Promo.find()
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    promos,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const getFeaturedPromo = async () => {
  return await Promo.findOne({ isFeatured: true, isActive: true }).sort({ updatedAt: -1 });
};

export const toggleFeatured = async (promoId) => {
  const promo = await Promo.findById(promoId);
  if (!promo) throw new AppError('Promo not found', 404);

  const newStatus = !promo.isFeatured;

  if (newStatus) {
    // If we are setting this to featured, unfeature all others
    await Promo.updateMany({}, { isFeatured: false });
  }

  promo.isFeatured = newStatus;
  await promo.save();
  return promo;
};
