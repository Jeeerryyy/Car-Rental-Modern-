import { getOwnerNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notification.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const list = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 };
  const result = await getOwnerNotifications(req.owner._id, pagination);
  return ApiResponse.success(res, 200, 'Notifications retrieved', result.notifications, result.pagination, { unreadCount: result.unreadCount });
});

export const markRead = catchAsync(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.owner._id);
  return ApiResponse.success(res, 200, 'Notification marked as read', { notification });
});

export const markAllRead = catchAsync(async (req, res) => {
  await markAllAsRead(req.owner._id);
  return ApiResponse.success(res, 200, 'All notifications marked as read');
});

export const remove = catchAsync(async (req, res) => {
  await deleteNotification(req.params.id, req.owner._id);
  return ApiResponse.success(res, 200, 'Notification deleted');
});
