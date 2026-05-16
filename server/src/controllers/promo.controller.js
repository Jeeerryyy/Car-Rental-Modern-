import { validatePromo, createPromo, getAllPromos, togglePromo, deletePromo, getFeaturedPromo, toggleFeatured as toggleFeaturedService } from '../services/promo.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const validate = catchAsync(async (req, res) => {
  const { code, orderValue } = req.body;
  const result = await validatePromo(code, orderValue);
  return ApiResponse.success(res, 200, 'Promo validated', result);
});

export const getFeatured = catchAsync(async (req, res) => {
  const promo = await getFeaturedPromo();
  return ApiResponse.success(res, 200, 'Featured promo retrieved', { promo });
});

export const toggleFeatured = catchAsync(async (req, res) => {
  const promo = await toggleFeaturedService(req.params.id);
  return ApiResponse.success(res, 200, `Promo featured status updated`, { promo });
});

export const create = catchAsync(async (req, res) => {
  const promo = await createPromo(req.body);
  return ApiResponse.success(res, 201, 'Promo created', { promo });
});

export const getAll = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getAllPromos(req.ownerId, pagination);
  return ApiResponse.success(res, 200, 'Promos retrieved', result.promos, result.pagination);
});

export const toggle = catchAsync(async (req, res) => {
  const promo = await togglePromo(req.params.id);
  return ApiResponse.success(res, 200, `Promo ${promo.isActive ? 'activated' : 'deactivated'}`, { promo });
});

export const remove = catchAsync(async (req, res) => {
  await deletePromo(req.params.id);
  return ApiResponse.success(res, 200, 'Promo deleted');
});
