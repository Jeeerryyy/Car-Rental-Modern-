import { Router } from 'express';
import { list, markRead, markAllRead, remove } from '../../controllers/notification.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', list);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);
router.delete('/:id', remove);

export default router;
