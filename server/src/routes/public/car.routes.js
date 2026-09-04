import { Router } from 'express';
import { getAll, getOne, getAvailability } from '../../controllers/car.controller.js';
import { search } from '../../controllers/search.controller.js';
import { categories } from '../../controllers/search.controller.js';
import { locations } from '../../controllers/search.controller.js';
import { featured } from '../../controllers/search.controller.js';
import { forCar } from '../../controllers/review.controller.js';

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars with optional filters
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by car type (SUV, Sedan, etc.)
 *       - in: query
 *         name: fuel
 *         schema:
 *           type: string
 *         description: Filter by fuel type (Petrol, Diesel, EV)
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *           enum: [Automatic, Manual]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: List of cars with pagination
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car details by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const router = Router();

router.get('/', getAll);
router.get('/search', search);
router.get('/categories', categories);
router.get('/locations', locations);
router.get('/featured', featured);
router.get('/:id', getOne);
router.get('/:id/availability', getAvailability);
router.get('/:carId/reviews', forCar);

export default router;
