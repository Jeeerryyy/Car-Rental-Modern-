import { Router } from 'express';
import { getOwnerContacts, updateContactStatus } from '../../controllers/contact.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', getOwnerContacts);
router.put('/:id/status', updateContactStatus);

export default router;
