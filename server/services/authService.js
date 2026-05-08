const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  // Parse expiresIn (e.g. '7d' -> milliseconds)
  const expiresInMs = parseInt(config.jwt.expiresIn) * 24 * 60 * 60 * 1000; 

  const cookieOptions = {
    expires: new Date(Date.now() + expiresInMs),
    httpOnly: true, // Secure against XSS
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(statusCode).json({
    success: true,
    data: {
      user,
    },
  });
};

const handleFailedLogin = async (user) => {
  if (user) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }
    await user.save({ validateBeforeSave: false });
  }
};

const handleSuccessfulLogin = async (user) => {
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });
};

module.exports = {
  signToken,
  createSendToken,
  handleFailedLogin,
  handleSuccessfulLogin
};
