import Car from '../models/Car.js';

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

  if (q) {
    query.$or = [
      { make: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
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

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Car.countDocuments(query);

  const cars = await Car.find(query)
    .populate('owner', 'name businessName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ averageRating: -1, totalBookings: -1 });

  const { injectBookingStatus } = await import('../utils/carUtils.js');
  const carsWithStatus = await injectBookingStatus(cars);

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
  const categories = await Car.distinct('category', { isActive: true, isDeleted: false });
  return categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat
  }));
};

export const getLocations = async () => {
  const locations = await Car.distinct('location', { isActive: true, isDeleted: false });
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
