import { Router } from 'express';
import { get, update } from '../../controllers/settings.controller.js';
import { updateSettingsRules } from '../../validators/settings.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/', get);
router.put('/', updateSettingsRules, validate, update);

export default router;
