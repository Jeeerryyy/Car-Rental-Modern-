import * as staffService from '../services/staff.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const list = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffMembers(req.ownerId);
  return ApiResponse.success(res, 200, 'Staff members retrieved', { staff });
});

export const create = catchAsync(async (req, res) => {
  const staff = await staffService.createStaffMember(req.ownerId, req.body);
  return ApiResponse.success(res, 201, 'Staff member created successfully', { staff });
});

export const toggleStatus = catchAsync(async (req, res) => {
  const staff = await staffService.toggleStaffStatus(req.params.id, req.ownerId);
  return ApiResponse.success(res, 200, `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`, { staff });
});

export const remove = catchAsync(async (req, res) => {
  await staffService.deleteStaffMember(req.params.id, req.ownerId);
  return ApiResponse.success(res, 200, 'Staff member deleted successfully');
});
