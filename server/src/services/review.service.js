import Review from '../models/Review.js';
import Car from '../models/Car.js';
import { AppError } from '../utils/AppError.js';
import { REVIEW_STATUS } from '../utils/constants.js';
import { createNotification } from './notification.service.js';

export const createReview = async (customerId, carId, bookingId, rating, comment) => {
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    throw new AppError('Review already exists for this booking', 400);
  }

  const review = await Review.create({
    car: carId,
    customer: customerId,
    booking: bookingId,
    rating,
    comment,
    status: REVIEW_STATUS.PENDING
  });

  const car = await Car.findById(carId);
  if (car?.owner) {
    await createNotification(
      car.owner,
      'Owner',
      'review_submitted',
      'New Review Received',
      `A new review has been submitted for ${car.make} ${car.model}`,
      `/owner/reviews/${review._id}`
    );
  }

  return review;
};

export const getCarReviews = async (carId, pagination = { page: 1, limit: 10 }) => {
  const query = { car: carId, status: REVIEW_STATUS.APPROVED };
  
  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate('customer', 'name profileImage')
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    reviews,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const updateReviewStatus = async (reviewId, ownerId, newStatus, ownerReply = null) => {
  const review = await Review.findById(reviewId).populate('car');

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.car.owner.toString() !== ownerId) {
    throw new AppError('Not authorized to moderate this review', 403);
  }

  review.status = newStatus;
  if (ownerReply) {
    review.ownerReply = ownerReply;
    review.replyDate = new Date();
  }
  await review.save();

  return review;
};

export const getOwnerReviews = async (ownerId, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const query = { 'car.owner': ownerId };

  if (filters.status) {
    query.status = filters.status;
  }

  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate('car', 'make model images')
    .populate('customer', 'name email')
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    reviews,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate('car', 'make model owner')
    .populate('customer', 'name email');

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  return review;
};
