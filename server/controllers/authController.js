const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const authService = require('../services/authService');

const getModelByRole = (role) => {
  return role === 'owner' ? Owner : Customer;
};

exports.register = catchAsync(async (req, res, next) => {
  const { role = 'customer', name, email, password, phone, businessName } = req.body;
  const Model = getModelByRole(role);

  const newUser = await Model.create({
    name,
    email,
    password,
    phone,
    businessName: role === 'owner' ? businessName : undefined,
    role
  });

  authService.createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role = 'customer' } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const Model = getModelByRole(role);
  
  // 1) Check if user exists && password is correct
  const user = await Model.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 2) Check if account is locked
  if (user.isLocked) {
    return next(new AppError('Account temporarily locked due to too many failed attempts. Please try again later.', 429));
  }

  // 3) Verify password
  const isCorrect = await user.correctPassword(password, user.password);

  if (!isCorrect) {
    await authService.handleFailedLogin(user);
    return next(new AppError('Incorrect email or password', 401));
  }

  // 4) If everything ok, send token to client
  await authService.handleSuccessfulLogin(user);
  authService.createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};

exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is populated by protect middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});
