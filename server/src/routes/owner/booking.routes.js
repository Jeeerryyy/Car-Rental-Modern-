import { Router } from 'express';
import { forOwner, updateStatus, manual, uploadOwnerDocuments, remove } from '../../controllers/booking.controller.js';
import { getInvoiceHTML, getInvoiceJSON } from '../../controllers/invoice.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF));

router.get('/', forOwner);
router.put('/:id/status', updateStatus);
router.post('/:id/documents', uploadOwnerDocuments);
router.get('/:id/invoice', getInvoiceHTML);
router.get('/:id/invoice/data', getInvoiceJSON);
router.post('/manual', manual);
router.delete('/:id', remove);

export default router;
