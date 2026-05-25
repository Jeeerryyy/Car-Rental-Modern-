import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { USER_ROLES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check Authorization header first (preferred)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fallback to cookies if no Bearer token in headers
  if (!token) {
    const isOwnerRoute = req.originalUrl.includes('/api/owner');
    if (isOwnerRoute) {
      token = req.cookies?.ownerToken;
    } else {
      token = req.cookies?.customerToken || req.cookies?.ownerToken;
    }
  }

  if (!token) {
    logger.warn(`[Auth protect] Access Denied. No token found in Authorization header or cookies. Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw new AppError('Access denied. No token provided.', 401);
  }

  // Check if token is blacklisted
  const { isTokenBlacklisted, isUserSessionRevoked } = await import('../utils/tokenRevocation.js');
  if (await isTokenBlacklisted(token)) {
    logger.warn(`[Auth protect] Access Denied. Token is blacklisted. Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw new AppError('Token is no longer valid (logged out).', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    logger.warn(`[Auth protect] JWT verification failed. Error: ${err.message}, Token Expiry Config: ${config.jwt.expiry}, Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw err;
  }

  // Check if user session was revoked before this token was issued
  if (await isUserSessionRevoked(decoded.id, decoded.iat)) {
    logger.warn(`[Auth protect] Access Denied. User session was revoked. User ID: ${decoded.id}, Token Iat: ${decoded.iat}, Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw new AppError('User session has been revoked. Please log in again.', 401);
  }
  
  let user;
  if (decoded.role === USER_ROLES.OWNER || decoded.role === USER_ROLES.STAFF) {
    user = await Owner.findById(decoded.id);
  } else if (decoded.role === USER_ROLES.CUSTOMER) {
    user = await Customer.findById(decoded.id);
  } else {
    logger.warn(`[Auth protect] Access Denied. Invalid role in token: ${decoded.role}. User ID: ${decoded.id}, Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw new AppError('Invalid role in token.', 401);
  }

  if (!user) {
    logger.warn(`[Auth protect] Access Denied. User belonging to token no longer exists. User ID: ${decoded.id}, Role: ${decoded.role}, Request URL: ${req.originalUrl}, IP: ${req.ip}`);
    throw new AppError('User belonging to this token does no longer exist.', 404);
  }

  if (!user.isActive) {
    logger.warn(`[Auth protect] Access Denied. Account is deactivated. User ID: ${decoded.id}, Role: ${decoded.role}, Request URL: ${req.originalUrl}, IP: ${req.ip}`);
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
