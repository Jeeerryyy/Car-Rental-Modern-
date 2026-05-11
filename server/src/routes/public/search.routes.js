import { Router } from 'express';
import { search } from '../../controllers/search.controller.js';
import { categories } from '../../controllers/search.controller.js';
import { locations } from '../../controllers/search.controller.js';
import { featured } from '../../controllers/search.controller.js';

const router = Router();

router.get('/', search);
router.get('/categories', categories);
router.get('/locations', locations);
router.get('/featured', featured);

export default router;
