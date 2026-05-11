import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, logout } from '../../controllers/customer.auth.controller.js';
import { registerRules, loginRules } from '../../validators/customer.auth.validator.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.get('/profile', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), getProfile);
router.put('/profile', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), updateProfile);
router.post('/change-password', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), changePassword);
router.post('/logout', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), logout);

export default router;
