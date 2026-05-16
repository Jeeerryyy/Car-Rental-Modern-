import { Router } from 'express';
import { create, verify, forCustomer, cancel, getOne, createOrder, createCashBooking } from '../../controllers/booking.controller.js';
import { createBookingRules } from '../../validators/booking.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { generalLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/', generalLimiter, protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), createBookingRules, validate, create);
router.post('/create-order', generalLimiter, protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), createBookingRules, validate, createOrder);
router.post('/cash-booking', generalLimiter, protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), createBookingRules, validate, createCashBooking);
router.get('/verify-payment', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), verify);
router.get('/my-bookings', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), forCustomer);
router.get('/:id', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), getOne);
router.put('/:id/cancel', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), cancel);

export default router;