import { Router } from 'express';
import { getMine, create, update, remove, toggle, blockDates, unblockDates } from '../../controllers/car.controller.js';
import { createCarRules, updateCarRules } from '../../validators/car.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { uploadCarImages } from '../../middleware/upload.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/my-cars', getMine);
router.post('/', uploadCarImages, createCarRules, validate, create);
router.put('/:id', uploadCarImages, updateCarRules, validate, update);
router.delete('/:id', remove);
router.patch('/:id/toggle-availability', toggle);
router.post('/:id/blocked-dates', blockDates);
router.delete('/:id/blocked-dates/:blockId', unblockDates);

export default router;
