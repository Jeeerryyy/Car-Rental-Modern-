import { getAllCars, getCarById, getCarAvailability, createCar, updateCar, deleteCar, toggleAvailability, addBlockedDates, removeBlockedDates, getOwnerCars } from '../services/car.service.js';
import { uploadCarImages as uploadToCloudinary } from '../services/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAll = catchAsync(async (req, res) => {
  const filters = {
    category: req.query.category,
    type: req.query.type,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    search: req.query.search,
    fuelType: req.query.fuelType,
    transmission: req.query.transmission,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getAllCars(filters, pagination);
  
  const publicCars = result.cars.map(c => {
    const { registrationNumber, ...rest } = c;
    return rest;
  });

  return ApiResponse.success(res, 200, 'Cars retrieved', publicCars, result.pagination);
});

export const getOne = catchAsync(async (req, res) => {
  const car = await getCarById(req.params.id, { startDate: req.query.startDate, endDate: req.query.endDate });
  
  if (!req.ownerId) {
    delete car.registrationNumber;
  }
  
  return ApiResponse.success(res, 200, 'Car retrieved', { car });
});

export const getAvailability = catchAsync(async (req, res) => {
  const availability = await getCarAvailability(req.params.id);
  return ApiResponse.success(res, 200, 'Car availability retrieved', availability);
});

export const create = catchAsync(async (req, res) => {
  let imageData = [];
  if (req.files?.length > 0) {
    const type = req.body.type || 'car';
    imageData = await uploadToCloudinary(req.files, type);
  }
  const car = await createCar(req.body, req.ownerId, imageData);
  return ApiResponse.success(res, 201, 'Car created', { car });
});

export const update = catchAsync(async (req, res) => {
  let newImages = [];
  if (req.files?.length > 0) {
    const existingCar = await getCarById(req.params.id);
    const type = req.body.type || existingCar.type || 'car';
    newImages = await uploadToCloudinary(req.files, type);
  }
  let removePublicIds = [];
  if (req.body.removeImages) {
    try {
      const parsed = JSON.parse(req.body.removeImages);
      if (Array.isArray(parsed)) {
        removePublicIds = parsed;
      }
    } catch (err) {
      // Safely ignore parsing errors if empty or malformed string is sent
    }
    delete req.body.removeImages;
  }
  const car = await updateCar(req.params.id, req.ownerId, req.body, newImages, removePublicIds);
  return ApiResponse.success(res, 200, 'Car updated', { car });
});

export const remove = catchAsync(async (req, res) => {
  await deleteCar(req.params.id, req.ownerId);
  return ApiResponse.success(res, 200, 'Car deleted');
});

export const toggle = catchAsync(async (req, res) => {
  const car = await toggleAvailability(req.params.id, req.ownerId);
  return ApiResponse.success(res, 200, `Car ${car.isActive ? 'activated' : 'deactivated'}`, { car });
});

export const blockDates = catchAsync(async (req, res) => {
  const car = await addBlockedDates(req.params.id, req.ownerId, req.body.startDate, req.body.endDate, req.body.reason);
  return ApiResponse.success(res, 200, 'Blocked dates added', { car });
});

export const unblockDates = catchAsync(async (req, res) => {
  const car = await removeBlockedDates(req.params.id, req.ownerId, req.params.blockId);
  return ApiResponse.success(res, 200, 'Blocked date removed', { car });
});

export const getMine = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getOwnerCars(req.ownerId, req.query, pagination);
  return ApiResponse.success(res, 200, 'Cars retrieved', result.cars, result.pagination);
});
