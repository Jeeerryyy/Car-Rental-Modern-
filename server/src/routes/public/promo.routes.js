import { Router } from 'express';
import { validate, getFeatured } from '../../controllers/promo.controller.js';
import { validatePromoRules } from '../../validators/promo.validator.js';
import { validate as validator } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.get('/featured', getFeatured);
router.post('/validate', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), validatePromoRules, validator, validate);

export default router;
