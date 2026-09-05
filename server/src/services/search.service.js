import Car from '../models/Car.js';
import cacheService from '../config/redis.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchCars = async (params = {}) => {
  const {
    q = '',
    category,
    minPrice,
    maxPrice,
    location,
    page = 1,
    limit = 10
  } = params;

  const query = { isActive: true, isDeleted: false };

  if (q && typeof q === 'string') {
    const safeQ = escapeRegex(q.trim());
    query.$or = [
      { make: { $regex: safeQ, $options: 'i' } },
      { model: { $regex: safeQ, $options: 'i' } },
      { description: { $regex: safeQ, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  if (location && typeof location === 'string') {
    query.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Car.countDocuments(query);

  const cars = await Car.find(query)
    .populate('owner', 'name businessName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ averageRating: -1, totalBookings: -1 });

  const dateRange = { startDate: params.startDate, endDate: params.endDate };
  const { injectBookingStatus } = await import('../utils/carUtils.js');
  const carsWithStatus = await injectBookingStatus(cars, dateRange);

  return {
    cars: carsWithStatus,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

export const getCategories = async () => {
  const cacheKey = 'cars:categories:distinct';
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const categories = await Car.distinct('category', { isActive: true, isDeleted: false });
  const formatted = categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat
  }));

  try {
    await cacheService.set(cacheKey, formatted, 600); // 10 min TTL
  } catch {}

  return formatted;
};

export const getLocations = async () => {
  const cacheKey = 'cars:locations:distinct';
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const locations = await Car.distinct('location', { isActive: true, isDeleted: false });

  try {
    await cacheService.set(cacheKey, locations, 600); // 10 min TTL
  } catch {}

  return locations;
};

export const getFeaturedCars = async (limit = 6) => {
  const cars = await Car.find({ isActive: true, isDeleted: false })
    .populate('owner', 'name businessName')
    .sort({ averageRating: -1, totalBookings: -1 })
    .limit(limit);

  const { injectBookingStatus } = await import('../utils/carUtils.js');
  return await injectBookingStatus(cars);
};
