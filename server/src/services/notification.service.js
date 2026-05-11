import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

export const createNotification = async (recipientId, recipientModel, type, title, message, link = null) => {
  const notification = await Notification.create({
    recipient: recipientId,
    recipientModel,
    type,
    title,
    message,
    link
  });

  // Emit real-time notification
  try {
    const room = recipientModel === 'Owner' ? `owner:${recipientId}` : `user:${recipientId}`;
    getIO().to(room).emit('notification:received', notification);
  } catch (err) {}

  return notification;
};

export const getOwnerNotifications = async (ownerId, pagination = { page: 1, limit: 20 }) => {
  const query = { recipient: ownerId, recipientModel: 'Owner' };
  
  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ ...query, read: false });

  const notifications = await Notification.find(query)
    .skip(skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

export const markAsRead = async (notificationId, ownerId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: ownerId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

export const markAllAsRead = async (ownerId) => {
  await Notification.updateMany(
    { recipient: ownerId, recipientModel: 'Owner', read: false },
    { read: true }
  );

  return { message: 'All notifications marked as read' };
};

export const deleteNotification = async (notificationId, ownerId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: ownerId
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

export const getUnreadCount = async (ownerId) => {
  const count = await Notification.countDocuments({
    recipient: ownerId,
    recipientModel: 'Owner',
    read: false
  });

  return { unreadCount: count };
};
