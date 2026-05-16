import { Router } from 'express';
import { getMine, getOne, create, update, remove, toggle, blockDates, unblockDates } from '../../controllers/car.controller.js';
import { createCarRules, updateCarRules } from '../../validators/car.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { uploadCarImages } from '../../middleware/upload.js';

const router = Router();

router.use(protect);

router.get('/my-cars', restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF), getMine);
router.get('/:id', restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF), getOne);
router.post('/', restrictTo(USER_ROLES.OWNER), uploadCarImages, createCarRules, validate, create);
router.put('/:id', restrictTo(USER_ROLES.OWNER), uploadCarImages, updateCarRules, validate, update);
router.delete('/:id', restrictTo(USER_ROLES.OWNER), remove);
router.patch('/:id/toggle-availability', restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF), toggle);
router.post('/:id/blocked-dates', restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF), blockDates);
router.delete('/:id/blocked-dates/:blockId', restrictTo(USER_ROLES.OWNER, USER_ROLES.STAFF), unblockDates);

export default router;
