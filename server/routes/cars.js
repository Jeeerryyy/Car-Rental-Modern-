const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { ownerProtect, customerProtect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCarRules, updateCarRules, calendarBlockRules } = require('../validators/carValidator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config/env');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false, isActive: true };
    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      Car.find(filter).skip(skip).limit(parseInt(limit)).lean(),
      Car.countDocuments(filter)
    ]);
    
    res.json({ 
      success: true, 
      data: cars,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cars' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const cars = await Car.find({ isFeatured: true, isDeleted: false, isActive: true }).limit(6).lean();
    res.json({ success: true, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured cars' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch car' });
  }
});

// Owner routes
router.post('/', ownerProtect, upload.array('images', 10), createCarRules, validate, async (req, res) => {
  try {
    const images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'cars' }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
          stream.end(file.buffer);
        });
        images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }
    
    const carData = { ...req.body, images, isDeleted: false, isActive: true, owner: req.owner._id };
    const car = await Car.create(carData);
    res.status(201).json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create car' });
  }
});

router.put('/:id', ownerProtect, upload.array('images', 10), updateCarRules, validate, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.owner._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { keepPublicIds } = req.body;
    const keepIds = keepPublicIds ? JSON.parse(keepPublicIds) : [];
    
    // Delete removed images
    for (const img of car.images) {
      if (!keepIds.includes(img.publicId)) {
        await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      }
    }
    
    // Upload new images
    const newImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'cars' }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
          stream.end(file.buffer);
        });
        newImages.push({ url: result.secure_url, publicId: result.public_id });
      }
    }
    
    // Keep selected + new
    const retained = car.images.filter(img => keepIds.includes(img.publicId));
    car.images = [...retained, ...newImages];
    
    Object.assign(car, req.body);
    await car.save();
    
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update car' });
  }
});

router.delete('/:id', ownerProtect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.owner._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const activeBooking = await Booking.findOne({ 
      car: req.params.id, 
      status: { $nin: ['cancelled', 'rejected', 'completed'] }
    });
    
    if (activeBooking) {
      car.isDeleted = true;
      car.isActive = false;
      await car.save();
      return res.json({ success: true, deleted: false, deactivated: true });
    }
    
    // Hard delete images
    for (const img of car.images) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }
    
    await Car.findByIdAndDelete(req.params.id);
    res.json({ success: true, deleted: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete car' });
  }
});

router.post('/:id/calendar/block', ownerProtect, calendarBlockRules, validate, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    
    car.unavailableDates.push({ startDate: req.body.startDate, endDate: req.body.endDate, reason: req.body.reason });
    await car.save();
    
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to block dates' });
  }
});

router.delete('/:id/calendar/block/:blockId', ownerProtect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    
    car.unavailableDates = car.unavailableDates.filter(b => b._id.toString() !== req.params.blockId);
    await car.save();
    
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove block' });
  }
});

module.exports = router;