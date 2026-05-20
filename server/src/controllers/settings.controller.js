import { getSettings, updateSettings } from '../services/settings.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const get = catchAsync(async (req, res) => {
  const settings = await getSettings(req.owner._id);
  return ApiResponse.success(res, 200, 'Settings retrieved', { settings });
});

export const update = catchAsync(async (req, res) => {
  const settings = await updateSettings(req.owner._id, req.body);
  return ApiResponse.success(res, 200, 'Settings updated', { settings });
});
