import { Request, Response, NextFunction } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  phone?: string;
  role: 'user' | 'admin';
  licenseNumber?: string;
  kyc?: {
    drivingLicenseUrl?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
  termsAccepted: boolean;
  aadhaarVerified: boolean;
  state?: string;
  membershipTier: 'Silver' | 'Gold' | 'Platinum';
  wishlist?: string[];
  resetOtp?: string;
  resetOtpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICar {
  _id: string;
  make: string;
  model: string;
  year: number;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'Bike' | 'Scooter';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  driveOption: 'Self Drive' | 'With Driver' | 'Both';
  securityDeposit: number;
  pricePerHour: number;
  pricePerDay: number;
  status: 'Available' | 'Rented' | 'Maintenance';
  images: string[];
  licensePlate: string;
  rating: number;
  features: string[];
  isPopular: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: string;
  userId: string;
  carId: ICar | string;
  manualName?: string;
  manualPhone?: string;
  source: 'online' | 'offline';
  pickupDate: Date;
  dropoffDate: Date;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
  basePrice?: number;
  discountAmount: number;
  promoCode?: string;
  securityDeposit: number;
  paymentMethod: 'Card' | 'UPI' | 'Cash' | 'NetBanking' | 'Pending';
  paymentStatus?: 'Pending' | 'Completed' | 'Failed';
  gstInvoiceNumber?: string;
  driverRequired: boolean;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';
  confirmationNumber: string;
  preRidePhotos: string[];
  postRidePhotos: string[];
  fuelOverageCharge: number;
  lateReturnPenalty: number;
  tollCharges: number;
  finalBilledAmount?: number;
  signatureUrl?: string;
  documents?: Array<{ type: 'Aadhaar' | 'Driving License'; url: string }>;
  receiptUrl?: string;
  termsAccepted: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromo {
  _id: string;
  code: string;
  description?: string;
  discountType: 'Fixed' | 'Percentage';
  discountValue: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  userId: string;
  carId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IRequest extends Request {
  id?: string;
  user?: IUser;
  pagination?: {
    page: number;
    limit: number;
    skip: number;
  };
}

export interface IResponse extends Response {
  pagination?: {
    page: number;
    limit: number;
    skip: number;
  };
}

export interface INextFunction extends NextFunction {}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthUser {
  id: string;
  role: 'user' | 'admin';
}

export interface JWTPayload {
  user: AuthUser;
  iat?: number;
  exp?: number;
  iss?: string;
}

export interface CarFilters {
  category?: string;
  transmission?: string;
  fuelType?: string;
  driveOption?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  pricePerDay?: {
    $gte?: number;
    $lte?: number;
  };
}

export interface BookingCreateInput {
  carId: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverRequired?: boolean;
  promoCode?: string;
}

export interface EnvConfig {
  MONGO_URI: string;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  REDIS_URL?: string;
  NODE_ENV?: 'development' | 'production';
  PORT?: string;
  CLIENT_URL?: string;
}