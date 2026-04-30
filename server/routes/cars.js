/**
 * Cars Routes - Public car listing and detail endpoints
 * @module routes/cars
 */

const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const paginate = require('../middleware/paginate');
const { redisClient, redisAvailable, invalidateCachePattern } = require('../utils/cache');

const CACHE_TTL = 300;

/**
 * GET /api/cars - List all cars with filtering and pagination
 * Query params: type, minPrice, maxPrice, transmission, fuelType, driveOption, isPopular, isFeatured
 */
router.get('/', paginate, async (req, res) => {
  try {
    const { type, minPrice, maxPrice, transmission, fuelType, driveOption, isPopular, isFeatured } = req.query;
    
    const cacheKey = `cars:list:${JSON.stringify(req.query)}:${req.pagination.page}:${req.pagination.limit}`;
    
    if (redisAvailable && redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const filter = {};

    if (type) filter.category = type;
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (driveOption) filter.driveOption = driveOption;
    if (isPopular) filter.isPopular = isPopular === 'true';
    if (isFeatured) filter.isFeatured = isFeatured === 'true';

    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    const { skip, limit, page } = req.pagination;

    const [cars, total] = await Promise.all([
      Car.find(filter).sort({ pricePerDay: 1 }).skip(skip).limit(limit).lean(),
      Car.countDocuments(filter),
    ]);

    const response = {
      success: true,
      data: cars,
      pagination: { total, page, limit, pages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };

    if (redisAvailable && redisClient) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/cars/featured - Get featured cars (cached)
 */
router.get('/featured', async (req, res) => {
  try {
    const cacheKey = 'cars:featured';
    
    if (redisAvailable && redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const cars = await Car.find({ isFeatured: true, status: 'Available' })
      .sort({ pricePerDay: 1 })
      .limit(6)
      .lean();

    const response = { success: true, data: cars };
    
    if (redisAvailable && redisClient) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/cars/popular - Get popular cars (cached)
 */
router.get('/popular', async (req, res) => {
  try {
    const cacheKey = 'cars:popular';
    
    if (redisAvailable && redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const cars = await Car.find({ isPopular: true, status: 'Available' })
      .sort({ rating: -1 })
      .limit(10)
      .lean();

    const response = { success: true, data: cars };
    
    if (redisAvailable && redisClient) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/cars/:id - Get single car details
 */
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `cars:single:${req.params.id}`;
    
    if (redisAvailable && redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });

    if (redisAvailable && redisClient) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(car));
    }

    res.json(car);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ success: false, error: 'Car not found' });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;