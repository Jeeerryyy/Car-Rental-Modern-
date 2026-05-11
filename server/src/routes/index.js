import { Router } from 'express';
import authRoutes from './public/auth.routes.js';
import carRoutes from './public/car.routes.js';
import bookingRoutes from './public/booking.routes.js';
import reviewRoutes from './public/review.routes.js';
import searchRoutes from './public/search.routes.js';
import promoRoutes from './public/promo.routes.js';
import contactRoutes from './public/contact.routes.js';
import ownerAuthRoutes from './owner/auth.routes.js';
import ownerCarRoutes from './owner/car.routes.js';
import ownerBookingRoutes from './owner/booking.routes.js';
import ownerReviewRoutes from './owner/review.routes.js';
import ownerPromoRoutes from './owner/promo.routes.js';
import ownerNotificationRoutes from './owner/notification.routes.js';
import ownerSettingsRoutes from './owner/settings.routes.js';
import ownerReportRoutes from './owner/report.routes.js';
import ownerClientRoutes from './owner/client.routes.js';
import razorpayRoutes from './webhooks/razorpay.routes.js';

import uploadRoutes from './public/upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/search', searchRoutes);
router.use('/promo', promoRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);

router.use('/owner/auth', ownerAuthRoutes);
router.use('/owner/cars', ownerCarRoutes);
router.use('/owner/bookings', ownerBookingRoutes);
router.use('/owner/reviews', ownerReviewRoutes);
router.use('/owner/promos', ownerPromoRoutes);
router.use('/owner/notifications', ownerNotificationRoutes);
router.use('/owner/settings', ownerSettingsRoutes);
router.use('/owner/reports', ownerReportRoutes);
router.use('/owner/clients', ownerClientRoutes);

router.use('/webhooks', razorpayRoutes);

export default router;
