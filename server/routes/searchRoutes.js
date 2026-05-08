const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const { 
    q, 
    location,
    category, 
    transmission, 
    fuelType,
    minPrice,
    maxPrice,
    features,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  const query = { status: 'active' };

  if (q) {
    query.$or = [
      { make: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } }
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (transmission) {
    query.transmission = transmission;
  }

  if (fuelType) {
    query.fuelType = fuelType;
  }

  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
  }

  if (features) {
    const featureList = features.split(',').map(f => f.trim());
    query.features = { $all: featureList };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [cars, total] = await Promise.all([
    Car.find(query)
      .populate('owner', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Car.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: cars,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

router.get('/suggestions', catchAsync(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const suggestions = await Car.find({
    status: 'active',
    $or: [
      { make: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ]
  })
  .select('make model location')
  .limit(10);

  const unique = [];
  const seen = new Set();
  
  suggestions.forEach(car => {
    const key = `${car.make}-${car.model}-${car.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(car);
    }
  });

  res.json({ success: true, data: unique });
}));

module.exports = router;