import { Router } from 'express';
import { forOwner, updateStatus, manual, uploadOwnerDocuments } from '../../controllers/booking.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF));

router.get('/', forOwner);
router.put('/:id/status', updateStatus);
router.post('/:id/documents', uploadOwnerDocuments);
router.post('/manual', manual);

export default router;
