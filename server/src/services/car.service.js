import Car from '../models/Car.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../config/socket.events.js';
import { deleteMultipleImages } from './cloudinary.service.js';
import { logger } from '../utils/logger.js';

export const getAllCars = async (filters = {}, pagination = { page: 1, limit: 10 }) => {
  const query = { isActive: true, isDeleted: false };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.pricePerDay = {};
    if (filters.minPrice) query.pricePerDay.$gte = filters.minPrice;
    if (filters.maxPrice) query.pricePerDay.$lte = filters.maxPrice;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.available) {
    const today = new Date();
    query.unavailableDates = {
      $not: {
        $elemMatch: {
          startDate: { $lte: today },
          endDate: { $gte: today }
        }
      }
    };
  }

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Car.countDocuments(query);

  const cars = await Car.find(query)
    .populate('owner', 'name businessName')
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  const { injectBookingStatus } = await import('../utils/carUtils.js');
  const carsWithStatus = await injectBookingStatus(cars);

  return {
    cars: carsWithStatus,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const getCarById = async (carId) => {
  const car = await Car.findOne({ _id: carId, isDeleted: false }).populate('owner', 'name businessName phone');
  
  if (!car) {
    throw new AppError('Car not found', 404);
  }

  const { injectBookingStatus } = await import('../utils/carUtils.js');
  const carsWithStatus = await injectBookingStatus([car]);
  return carsWithStatus[0];
};

export const createCar = async (carData, ownerId, imageFiles = []) => {
  const car = await Car.create({
    ...carData,
    owner: ownerId,
    images: imageFiles
  });
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_CREATED, car);
  } catch (err) {
    logger.error('Socket emit error: ', err);
  }
  return car;
};

export const updateCar = async (carId, ownerId, updates, newImageFiles = [], removeImagePublicIds = []) => {
  const car = await Car.findOne({ _id: carId, owner: ownerId, isDeleted: false });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  Object.assign(car, updates);

  if (newImageFiles.length > 0) {
    car.images.push(...newImageFiles);
  }

  if (removeImagePublicIds.length > 0) {
    car.images = car.images.filter(img => !removeImagePublicIds.includes(img.publicId));
    // Clean up from Cloudinary
    await deleteMultipleImages(removeImagePublicIds).catch(() => {});
  }

  await car.save();
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_UPDATED, car);
  } catch (err) {
    logger.error('Socket emit error:', err);
  }
  return car;
};

export const deleteCar = async (carId, ownerId) => {
  const car = await Car.findOne({ _id: carId, owner: ownerId });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  // Check for active bookings before allowing deletion
  const { default: Booking } = await import('../models/Booking.js');
  const activeBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  if (activeBooking) {
    throw new AppError('Cannot delete a car with active bookings. Cancel or complete all bookings first.', 409);
  }

  car.isDeleted = true;
  car.isActive = false;
  await car.save();
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_DELETED, carId);
  } catch (err) {
    logger.error('Socket emit error:', err);
  }
  return car;
};

export const toggleAvailability = async (carId, ownerId) => {
  const car = await Car.findOne({ _id: carId, owner: ownerId, isDeleted: false });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  car.isActive = !car.isActive;
  await car.save();
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, { carId, isActive: car.isActive });
  } catch (err) {
    logger.error('Socket emit error:', err);
  }
  return car;
};

export const addBlockedDates = async (carId, ownerId, startDate, endDate, reason) => {
  const car = await Car.findOne({ _id: carId, owner: ownerId, isDeleted: false });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  car.unavailableDates.push({ startDate, endDate, reason });
  await car.save();
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, { carId });
  } catch (err) {
    logger.error('Socket emit error:', err);
  }
  return car;
};

export const removeBlockedDates = async (carId, ownerId, blockId) => {
  const car = await Car.findOneAndUpdate(
    { _id: carId, owner: ownerId, isDeleted: false },
    { $pull: { unavailableDates: { _id: blockId } } },
    { new: true }
  );

  if (!car) {
    throw new AppError('Car not found', 404);
  }
  try {
    getIO().to('public').emit(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, { carId });
  } catch (err) {
    logger.error('Socket emit error:', err);
  }
  return car;
};

export const getOwnerCars = async (ownerId, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const query = { owner: ownerId, isDeleted: false };

  if (filters.status === 'active') query.isActive = true;
  if (filters.status === 'inactive') query.isActive = false;

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Car.countDocuments(query);

  const cars = await Car.find(query)
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    cars,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};
