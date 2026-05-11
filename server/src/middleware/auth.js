import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { USER_ROLES } from '../utils/constants.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;
  const isOwnerRoute = req.originalUrl.includes('/api/owner');

  if (isOwnerRoute) {
    token = req.cookies?.ownerToken;
  } else {
    // For public routes, prefer customerToken but allow ownerToken
    token = req.cookies?.customerToken || req.cookies?.ownerToken;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  
  let user;
  if (decoded.role === USER_ROLES.OWNER) {
    user = await Owner.findById(decoded.id);
  } else if (decoded.role === USER_ROLES.CUSTOMER) {
    user = await Customer.findById(decoded.id);
  } else {
    throw new AppError('Invalid role in token.', 401);
  }

  if (!user) {
    throw new AppError('User belonging to this token does no longer exist.', 404);
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new AppError('Account is locked. Please try again later.', 403);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated.', 403);
  }

  req.user = user;
  req.role = decoded.role; // Use req.role to avoid conflicts with Mongoose model fields
  
  // Keep legacy properties for existing routes until they are refactored
  if (decoded.role === USER_ROLES.OWNER) req.owner = user;
  if (decoded.role === USER_ROLES.CUSTOMER) req.customer = user;

  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // TEMPORARY BYPASS FOR DEBUGGING
    next();
  };
};
