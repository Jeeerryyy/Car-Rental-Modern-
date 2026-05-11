import { Router } from 'express';
import { submit } from '../../controllers/review.controller.js';
import { createReviewRules } from '../../validators/review.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { generalLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/', generalLimiter, protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), createReviewRules, validate, submit);

export default router;
