import api from './axiosInstance';

export const getNotifications = (params) => api.get('/owner/notifications', { params });
export const markAsRead = (id) => api.patch(`/owner/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/owner/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/owner/notifications/${id}`);
