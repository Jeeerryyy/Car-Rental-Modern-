import { Router } from 'express';
import { getAll, getOne } from '../../controllers/car.controller.js';
import { search } from '../../controllers/search.controller.js';
import { categories } from '../../controllers/search.controller.js';
import { locations } from '../../controllers/search.controller.js';
import { featured } from '../../controllers/search.controller.js';
import { forCar } from '../../controllers/review.controller.js';

const router = Router();

router.get('/', getAll);
router.get('/search', search);
router.get('/categories', categories);
router.get('/locations', locations);
router.get('/featured', featured);
router.get('/:id', getOne);
router.get('/:carId/reviews', forCar);

export default router;
