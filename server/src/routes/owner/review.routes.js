import { Router } from 'express';
import { forOwner, moderate } from '../../controllers/review.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', forOwner);
router.put('/:id/status', moderate);

export default router;
