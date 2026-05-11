import { registerCustomer, loginCustomer, getCustomerById, updateCustomerProfile, changeCustomerPassword } from '../services/customer.auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await registerCustomer(name, email, password, phone);
  
  res.cookie('customerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  
  return ApiResponse.success(res, 201, 'Registration successful', { customer: result.customer });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginCustomer(email, password);

  res.cookie('customerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return ApiResponse.success(res, 200, 'Login successful', { customer: result.customer });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('customerToken');
  return ApiResponse.success(res, 200, 'Logged out successfully');
});

export const getProfile = catchAsync(async (req, res) => {
  // If we have a customer object, use it. If not (e.g. user is logged in as Owner), 
  // use req.owner to provide a valid profile response.
  const user = req.customer || req.owner || req.user;
  
  if (!user) {
    throw new AppError('Profile not found', 404);
  }

  // Return formatted user data consistent with what the public app expects
  const profileData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: req.role || user.role,
    phone: user.phone
  };

  return ApiResponse.success(res, 200, 'Profile retrieved', { customer: profileData });
});

export const updateProfile = catchAsync(async (req, res) => {
  const customer = await updateCustomerProfile(req.customer._id, req.body);
  return ApiResponse.success(res, 200, 'Profile updated', { customer });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changeCustomerPassword(req.customer._id, currentPassword, newPassword);
  return ApiResponse.success(res, 200, result.message);
});
