import { createReview, getCarReviews, getOwnerReviews, updateReviewStatus } from '../services/review.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const submit = catchAsync(async (req, res) => {
  const { carId, bookingId, rating, comment } = req.body;
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const review = await createReview(userId, carId, bookingId, rating, comment);
  return ApiResponse.success(res, 201, 'Review submitted', { review });
});

export const forCar = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getCarReviews(req.params.carId, pagination);
  return ApiResponse.success(res, 200, 'Reviews retrieved', result.reviews, result.pagination);
});

export const forOwner = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
  const result = await getOwnerReviews(req.owner._id, req.query, pagination);
  return ApiResponse.success(res, 200, 'Reviews retrieved', result.reviews, result.pagination);
});

export const moderate = catchAsync(async (req, res) => {
  const { status, ownerReply } = req.body;
  const review = await updateReviewStatus(req.params.id, req.owner._id, status, ownerReply);
  return ApiResponse.success(res, 200, 'Review updated', { review });
});
