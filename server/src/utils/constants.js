export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner'
};

export const PROMO_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const NOTIFICATION_TYPES = {
  NEW_BOOKING: 'new_booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  REVIEW_SUBMITTED: 'review_submitted',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  GENERAL: 'general'
};

export const RATE_LIMIT = {
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX: 5,
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX: 100
};

export const JWT_EXPIRY = {
  OWNER: '7d',
  CUSTOMER: '30d'
};

export const BCRYPT_ROUNDS = 12;

export const CLOUDINARY_FOLDERS = {
  CAR_IMAGES: 'modern-drive/cars',
  PROFILE_IMAGES: 'modern-drive/profiles',
  DOCUMENTS: 'modern-drive/documents'
};

export const CLOUDINARY_PUBLIC_ID_PREFIXES = {
  CAR_IMAGES: 'modern-drive/cars/',
  PROFILE_IMAGES: 'modern-drive/profiles/',
  DOCUMENTS: 'modern-drive/documents/'
};

export const CAR_CATEGORIES = ['sedan', 'suv', 'luxury', 'sports', 'van'];

export const UPLOAD_LIMITS = {
  IMAGES: 5 * 1024 * 1024,
  DOCUMENTS: 10 * 1024 * 1024,
  MAX_IMAGES: 10,
  MAX_PROFILE_IMAGES: 1,
  MAX_DOCUMENT_IMAGES: 2
};

export default {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  PROMO_TYPES,
  REVIEW_STATUS,
  NOTIFICATION_TYPES,
  RATE_LIMIT,
  JWT_EXPIRY,
  BCRYPT_ROUNDS,
  CLOUDINARY_FOLDERS,
  CLOUDINARY_PUBLIC_ID_PREFIXES,
  CAR_CATEGORIES,
  UPLOAD_LIMITS
};
