const express  = require('express');
const router   = express.Router();
const Car      = require('../models/Car');
const paginate = require('../middleware/paginate');

/* ── list (paginated + filterable) ───────────────────────── */
router.get('/', paginate, async (req, res) => {
  try {
    const { type, minPrice, maxPrice, transmission, fuelType, driveOption } = req.query;
    const filter = {};

    if (type)         filter.category     = type;
    if (transmission) filter.transmission = transmission;
    if (fuelType)     filter.fuelType     = fuelType;
    if (driveOption)  filter.driveOption  = driveOption;

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

    res.json({
      success: true,
      data: cars,
      pagination: {
        total, page, limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('[cars/list]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── detail ──────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    res.json(car);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }
    console.error('[cars/detail]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
