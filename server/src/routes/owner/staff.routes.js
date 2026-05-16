import { Router } from 'express';
import * as staffController from '../../controllers/staff.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

// All staff routes are restricted to the primary OWNER
router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', staffController.list);
router.post('/', staffController.create);
router.patch('/:id/toggle', staffController.toggleStatus);
router.delete('/:id', staffController.remove);

export default router;
