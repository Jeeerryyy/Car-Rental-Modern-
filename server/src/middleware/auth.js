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
  if (decoded.role === USER_ROLES.OWNER || decoded.role === USER_ROLES.STAFF) {
    user = await Owner.findById(decoded.id);
  } else if (decoded.role === USER_ROLES.CUSTOMER) {
    user = await Customer.findById(decoded.id);
  } else {
    throw new AppError('Invalid role in token.', 401);
  }

  if (!user) {
    throw new AppError('User belonging to this token does no longer exist.', 404);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated.', 403);
  }

  req.user = user;
  req.role = decoded.role;
  
  if (decoded.role === USER_ROLES.OWNER || decoded.role === USER_ROLES.STAFF) {
    req.owner = user;
    // Business ID is either the owner's ID or the parentOwner's ID for staff
    req.ownerId = user.role === USER_ROLES.STAFF ? user.parentOwner : user._id;
  }
  
  if (decoded.role === USER_ROLES.CUSTOMER) {
    req.customer = user;
  }

  next();

});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};
