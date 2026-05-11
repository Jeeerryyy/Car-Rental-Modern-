import { Router } from 'express';
import { create, getAll, toggle, remove, toggleFeatured } from '../../controllers/promo.controller.js';
import { createPromoRules } from '../../validators/promo.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', getAll);
router.post('/', createPromoRules, validate, create);
router.patch('/:id/toggle', toggle);
router.patch('/:id/featured', toggleFeatured);
router.delete('/:id', remove);

export default router;
