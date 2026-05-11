import { Router } from 'express';
import { submitContact } from '../../controllers/contact.controller.js';
import { contactRules } from '../../validators/contact.validator.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/', authLimiter, contactRules, validate, submitContact);

export default router;
