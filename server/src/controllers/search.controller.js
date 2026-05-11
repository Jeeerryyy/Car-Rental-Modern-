import { searchCars, getCategories, getLocations, getFeaturedCars } from '../services/search.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const search = catchAsync(async (req, res) => {
  const result = await searchCars(req.query);
  return ApiResponse.success(res, 200, 'Search results', result.cars, result.pagination);
});

export const categories = catchAsync(async (req, res) => {
  const cats = await getCategories();
  return ApiResponse.success(res, 200, 'Categories retrieved', cats);
});

export const locations = catchAsync(async (req, res) => {
  const locs = await getLocations();
  return ApiResponse.success(res, 200, 'Locations retrieved', locs);
});

export const featured = catchAsync(async (req, res) => {
  const cars = await getFeaturedCars(parseInt(req.query.limit) || 6);
  return ApiResponse.success(res, 200, 'Featured cars retrieved', cars);
});
