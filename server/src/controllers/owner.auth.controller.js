import { registerOwner, loginOwner, getOwnerById, updateOwnerProfile, changeOwnerPassword } from '../services/owner.auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone, businessName } = req.body;
  const result = await registerOwner(name, email, password, phone, businessName);

  res.cookie('ownerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.success(res, 201, 'Registration successful', { owner: result.owner });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginOwner(email, password);

  res.cookie('ownerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.success(res, 200, 'Login successful', { owner: result.owner });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('ownerToken');
  return ApiResponse.success(res, 200, 'Logged out successfully');
});

export const getProfile = catchAsync(async (req, res) => {
  const owner = await getOwnerById(req.owner._id);
  return ApiResponse.success(res, 200, 'Profile retrieved', { owner });
});

export const updateProfile = catchAsync(async (req, res) => {
  const owner = await updateOwnerProfile(req.owner._id, req.body);
  return ApiResponse.success(res, 200, 'Profile updated', { owner });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changeOwnerPassword(req.owner._id, currentPassword, newPassword);
  return ApiResponse.success(res, 200, result.message);
});
