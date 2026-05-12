import { Router } from 'express';
import { create, verify, forCustomer, cancel, getOne } from '../../controllers/booking.controller.js';
import { createBookingRules } from '../../validators/booking.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { generalLimiter } from '../../middleware/rateLimiter.js';

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *               - pickupDate
 *               - dropoffDate
 *               - pickupLocation
 *             properties:
 *               carId:
 *                 type: string
 *               pickupDate:
 *                 type: string
 *                 format: date
 *               dropoffDate:
 *                 type: string
 *                 format: date
 *               pickupLocation:
 *                 type: string
 *               dropoffLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

const router = Router();

router.post('/', generalLimiter, protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), createBookingRules, validate, create);
router.get('/verify-payment', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), verify);
router.get('/my-bookings', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), forCustomer);
router.get('/:id', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), getOne);
router.put('/:id/cancel', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), cancel);

export default router;
