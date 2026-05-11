import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { USER_ROLES } from '../utils/constants.js';

const signToken = (id) => {
  return jwt.sign(
    { id, role: USER_ROLES.CUSTOMER },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry }
  );
};

export const registerCustomer = async (name, email, password, phone) => {
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    throw new AppError('Email already registered', 409);
  }

  const customer = await Customer.create({ name, email, password, phone });
  const token = signToken(customer._id);

  const userObj = customer.toObject();
  delete userObj.password;

  return { token, customer: userObj };
};

export const loginCustomer = async (email, password) => {
  const customer = await Customer.findOne({ email }).select('+password');

  if (!customer) {
    throw new AppError('Invalid email or password', 401);
  }

  if (customer.lockUntil && customer.lockUntil > Date.now()) {
    throw new AppError('Account is locked. Please try again after 15 minutes.', 403);
  }

  const isMatch = await bcrypt.compare(password, customer.password);

  if (!isMatch) {
    customer.loginAttempts += 1;
    if (customer.loginAttempts >= 5) {
      customer.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await customer.save();
    throw new AppError('Invalid email or password', 401);
  }

  customer.loginAttempts = 0;
  customer.lockUntil = undefined;
  await customer.save();

  const token = signToken(customer._id);
  const userObj = customer.toObject();
  delete userObj.password;

  return { token, customer: userObj };
};

export const getCustomerById = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  return customer;
};

export const updateCustomerProfile = async (customerId, updates) => {
  const allowedUpdates = ['name', 'phone', 'profileImage'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  return customer;
};

export const changeCustomerPassword = async (customerId, currentPassword, newPassword) => {
  const customer = await Customer.findById(customerId).select('+password');

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, customer.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  customer.password = newPassword;
  await customer.save();

  return { message: 'Password changed successfully' };
};
