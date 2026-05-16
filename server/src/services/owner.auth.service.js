import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Owner from '../models/Owner.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { USER_ROLES } from '../utils/constants.js';

const signToken = (id) => {
  return jwt.sign({ id, role: USER_ROLES.OWNER }, config.jwt.secret, {
    expiresIn: config.jwt.expiry
  });
};

export const registerOwner = async (name, email, password, phone, businessName) => {
  const existingOwner = await Owner.findOne({ email });
  if (existingOwner) {
    throw new AppError('Email already registered', 409);
  }

  const owner = await Owner.create({ name, email, password, phone, businessName });
  const token = signToken(owner._id);

  const userObj = owner.toObject();
  delete userObj.password;

  return { token, owner: userObj };
};

export const loginOwner = async (email, password) => {
  const owner = await Owner.findOne({ email }).select('+password');

  if (!owner) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, owner.password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }


  const token = signToken(owner._id);
  const userObj = owner.toObject();
  delete userObj.password;

  return { token, owner: userObj };
};

export const getOwnerById = async (ownerId) => {
  const owner = await Owner.findById(ownerId);
  if (!owner) {
    throw new AppError('Owner not found', 404);
  }
  return owner;
};

export const updateOwnerProfile = async (ownerId, updates) => {
  const allowedUpdates = ['name', 'phone', 'businessName', 'profileImage'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const owner = await Owner.findByIdAndUpdate(
    ownerId,
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!owner) {
    throw new AppError('Owner not found', 404);
  }

  return owner;
};

export const changeOwnerPassword = async (ownerId, currentPassword, newPassword) => {
  const owner = await Owner.findById(ownerId).select('+password');

  if (!owner) {
    throw new AppError('Owner not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, owner.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  owner.password = newPassword;
  await owner.save();

  return { message: 'Password changed successfully' };
};

export const requestOwnerPasswordReset = async (email) => {
  const owner = await Owner.findOne({ email });

  if (!owner) {
    return { message: 'If the email exists, a reset link will be sent' };
  }

  const resetToken = jwt.sign(
    { id: owner._id, type: 'owner-password-reset' },
    config.jwt.secret,
    { expiresIn: '15m' }
  );

  owner.passwordResetToken = resetToken;
  owner.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await owner.save();

  return { resetToken, owner };
};

export const resetOwnerPassword = async (resetToken, newPassword) => {
  const decoded = jwt.verify(resetToken, config.jwt.secret);

  if (decoded.type !== 'owner-password-reset') {
    throw new AppError('Invalid reset token', 400);
  }

  const owner = await Owner.findById(decoded.id);

  if (!owner || !owner.passwordResetToken) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (owner.passwordResetExpires < Date.now()) {
    throw new AppError('Reset token has expired', 400);
  }

  owner.password = newPassword;
  owner.passwordResetToken = undefined;
  owner.passwordResetExpires = undefined;
  await owner.save();

  return { message: 'Password reset successful' };
};
