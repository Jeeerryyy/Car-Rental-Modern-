import { registerOwner, loginOwner, getOwnerById, updateOwnerProfile, changeOwnerPassword, requestOwnerPasswordReset, resetOwnerPassword } from '../services/owner.auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../services/email.service.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone, businessName } = req.body;
  const result = await registerOwner(name, email, password, phone, businessName);

  res.cookie('ownerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production',
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.success(res, 200, 'Login successful', { owner: result.owner });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('ownerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production'
  });
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

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await requestOwnerPasswordReset(email);

  if (result.resetToken && result.owner) {
    const resetUrl = `${process.env.PORTAL_URL || process.env.CLIENT_URL}/reset-password?token=${result.resetToken}&type=owner`;
    await sendEmail({
      to: result.owner.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  }

  return ApiResponse.success(res, 200, 'If the email exists, a reset link has been sent');
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const result = await resetOwnerPassword(token, password);
  return ApiResponse.success(res, 200, result.message);
});
