const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const config = require('../config/env');

const getCookieName = (type) => type === 'owner' ? 'owner_token' : 'customer_token';
const getJwtSecret = (type) => type === 'owner' ? config.jwt.secret : (process.env.CUSTOMER_JWT_SECRET || config.jwt.secret);

exports.ownerProtect = catchAsync(async (req, res, next) => {
  const tokenName = getCookieName('owner');
  let token = req.cookies[tokenName];

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please sign in to access.', 401));
  }

  const decoded = jwt.verify(token, getJwtSecret('owner'));

  if (decoded.role !== 'owner') {
    return next(new AppError('Access denied. Owner credentials required.', 403));
  }

  const owner = await Owner.findById(decoded.id);
  if (!owner) {
    return next(new AppError('Owner account not found.', 401));
  }

  req.owner = owner;
  next();
});

exports.customerProtect = catchAsync(async (req, res, next) => {
  const tokenName = getCookieName('customer');
  let token = req.cookies[tokenName];

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please sign in to access.', 401));
  }

  const decoded = jwt.verify(token, getJwtSecret('customer'));

  if (decoded.role !== 'customer') {
    return next(new AppError('Access denied. Customer credentials required.', 403));
  }

  const customer = await Customer.findById(decoded.id);
  if (!customer) {
    return next(new AppError('Customer account not found.', 401));
  }

  req.customer = customer;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};