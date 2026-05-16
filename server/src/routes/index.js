import { Router } from 'express';
import authRoutes from './public/auth.routes.js';
import carRoutes from './public/car.routes.js';
import bookingRoutes from './public/booking.routes.js';
import reviewRoutes from './public/review.routes.js';
import searchRoutes from './public/search.routes.js';
import promoRoutes from './public/promo.routes.js';
import contactRoutes from './public/contact.routes.js';
import uploadRoutes from './public/upload.routes.js';
import ownerAuthRoutes from './owner/auth.routes.js';
import ownerCarRoutes from './owner/car.routes.js';
import ownerBookingRoutes from './owner/booking.routes.js';
import ownerReviewRoutes from './owner/review.routes.js';
import ownerPromoRoutes from './owner/promo.routes.js';
import ownerNotificationRoutes from './owner/notification.routes.js';
import ownerSettingsRoutes from './owner/settings.routes.js';
import ownerReportRoutes from './owner/report.routes.js';
import ownerClientRoutes from './owner/client.routes.js';
import ownerStaffRoutes from './owner/staff.routes.js';
import razorpayRoutes from './webhooks/razorpay.routes.js';

import { uploadDocument } from '../middleware/upload.js';
import { uploadDocument as uploadToCloudinary } from '../services/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { protect } from '../middleware/auth.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const router = Router();

if (config.nodeEnv === 'development') {
  router.use((req, res, next) => {
    console.log(`[API Router] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Public Routes (authenticated)
router.post('/upload', protect, uploadDocument, catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ApiResponse.error(res, 400, 'No files uploaded');
  }

  const results = [];
  for (const file of req.files) {
    try {
      const result = await uploadToCloudinary(file);
      results.push(result);
    } catch (uploadError) {
      logger.error('Cloudinary upload error:', uploadError);
      return ApiResponse.error(res, 500, `Upload failed: ${uploadError.message}`);
    }
  }

  return ApiResponse.success(res, 200, 'Files uploaded successfully', { files: results });
}));

router.use('/auth', authRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/search', searchRoutes);
router.use('/promo', promoRoutes);
router.use('/contact', contactRoutes);

// Owner Routes
router.use('/owner/auth', ownerAuthRoutes);
router.use('/owner/cars', ownerCarRoutes);
router.use('/owner/bookings', ownerBookingRoutes);
router.use('/owner/reviews', ownerReviewRoutes);
router.use('/owner/promos', ownerPromoRoutes);
router.use('/owner/notifications', ownerNotificationRoutes);
router.use('/owner/settings', ownerSettingsRoutes);
router.use('/owner/reports', ownerReportRoutes);
router.use('/owner/clients', ownerClientRoutes);
router.use('/owner/staff', ownerStaffRoutes);

// Webhooks
router.use('/webhooks', razorpayRoutes);

export default router;
