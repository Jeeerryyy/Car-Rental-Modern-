const Car = require('../models/Car');
const { invalidateCachePattern, redisClient, redisAvailable } = require('../utils/cache');
const logger = require('../utils/logger');

const CACHE_TTL = 300;

const carService = {
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Car.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Car.countDocuments(filter)
    ]);
    
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  },

  async findById(id) {
    return Car.findById(id).lean();
  },

  async create(carData) {
    const car = await Car.create(carData);
    await this.invalidateCache();
    logger.info(`[CAR] Created: ${car._id}`);
    return car;
  },

  async update(id, carData) {
    const car = await Car.findByIdAndUpdate(id, carData, { new: true, runValidators: true });
    if (!car) return null;
    await this.invalidateCache();
    logger.info(`[CAR] Updated: ${id}`);
    return car;
  },

  async delete(id) {
    const car = await Car.findById(id);
    if (!car) return null;
    await car.deleteOne();
    await this.invalidateCache();
    logger.info(`[CAR] Deleted: ${id}`);
    return car;
  },

  async getFeatured() {
    const cacheKey = 'cars:featured';
    if (redisAvailable && redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }
    
    const cars = await Car.find({ isFeatured: true, status: 'Available' })
      .sort({ pricePerDay: 1 }).limit(6).lean();
    
    if (redisAvailable && redisClient) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(cars));
    }
    return cars;
  },

  async invalidateCache() {
    try {
      await invalidateCachePattern('cars:*');
    } catch (err) {
      logger.warn(`[CACHE] Invalidation failed: ${err.message}`);
    }
  }
};

module.exports = carService;