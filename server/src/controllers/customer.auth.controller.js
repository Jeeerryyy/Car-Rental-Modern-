import { registerCustomer, loginCustomer, googleLoginCustomer, getCustomerById, updateCustomerProfile, changeCustomerPassword, requestPasswordReset, resetCustomerPassword } from '../services/customer.auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { sendEmail } from '../services/email.service.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await registerCustomer(name, email, password, phone);
  
  res.cookie('customerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production',
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return ApiResponse.success(res, 200, 'Login successful', { customer: result.customer });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('customerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production'
  });
  return ApiResponse.success(res, 200, 'Logged out successfully');
});

export const googleAuth = catchAsync(async (req, res) => {
  const { credential } = req.body;
  const result = await googleLoginCustomer(credential);

  res.cookie('customerToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return ApiResponse.success(res, 200, 'Google Login successful', { customer: result.customer });
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

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await requestPasswordReset(email);

  if (result.resetToken && result.customer) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${result.resetToken}&type=customer`;
    await sendEmail({
      to: result.customer.email,
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
  const result = await resetCustomerPassword(token, password);
  return ApiResponse.success(res, 200, result.message);
});
