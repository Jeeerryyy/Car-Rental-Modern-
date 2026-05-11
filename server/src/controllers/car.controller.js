import { getAllCars, getCarById, createCar, updateCar, deleteCar, toggleAvailability, addBlockedDates, removeBlockedDates, getOwnerCars } from '../services/car.service.js';
import { uploadCarImages as uploadToCloudinary } from '../services/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAll = catchAsync(async (req, res) => {
  const filters = { category: req.query.category, minPrice: req.query.minPrice, maxPrice: req.query.maxPrice, search: req.query.search };
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getAllCars(filters, pagination);
  return ApiResponse.success(res, 200, 'Cars retrieved', result.cars, result.pagination);
});

export const getOne = catchAsync(async (req, res) => {
  const car = await getCarById(req.params.id);
  return ApiResponse.success(res, 200, 'Car retrieved', { car });
});

export const create = catchAsync(async (req, res) => {
  let imageData = [];
  if (req.files?.length > 0) {
    imageData = await uploadToCloudinary(req.files);
  }
  const car = await createCar(req.body, req.owner._id, imageData);
  return ApiResponse.success(res, 201, 'Car created', { car });
});

export const update = catchAsync(async (req, res) => {
  let newImages = [];
  if (req.files?.length > 0) {
    newImages = await uploadToCloudinary(req.files);
  }
  const removePublicIds = req.body.removeImages ? JSON.parse(req.body.removeImages) : [];
  const car = await updateCar(req.params.id, req.owner._id, req.body, newImages, removePublicIds);
  return ApiResponse.success(res, 200, 'Car updated', { car });
});

export const remove = catchAsync(async (req, res) => {
  await deleteCar(req.params.id, req.owner._id);
  return ApiResponse.success(res, 200, 'Car deleted');
});

export const toggle = catchAsync(async (req, res) => {
  const car = await toggleAvailability(req.params.id, req.owner._id);
  return ApiResponse.success(res, 200, `Car ${car.isActive ? 'activated' : 'deactivated'}`, { car });
});

export const blockDates = catchAsync(async (req, res) => {
  const car = await addBlockedDates(req.params.id, req.owner._id, req.body.startDate, req.body.endDate, req.body.reason);
  return ApiResponse.success(res, 200, 'Blocked dates added', { car });
});

export const unblockDates = catchAsync(async (req, res) => {
  const car = await removeBlockedDates(req.params.id, req.owner._id, req.params.blockId);
  return ApiResponse.success(res, 200, 'Blocked date removed', { car });
});

export const getMine = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getOwnerCars(req.owner._id, req.query, pagination);
  return ApiResponse.success(res, 200, 'Cars retrieved', result.cars, result.pagination);
});
