import api from './axiosInstance';
import { getBookings } from './bookings.js';
import { getCars } from './cars.js';
import { getNotifications } from './notifications.js';

export const getDashboardStats = async () => {
  const [statsRes, bookingsRes, notificationsRes] = await Promise.all([
    api.get('/owner/reports/dashboard'),
    getBookings({ page: 1, limit: 5 }),
    getNotifications({ page: 1, limit: 5 })
  ]);

  const stats = statsRes.data.data;
  const bookings = bookingsRes.data.data || [];
  const unreadCount = notificationsRes.data.unreadCount || 0;

  return {
    data: {
      ...stats,
      unreadNotifications: unreadCount,
      recentBookings: bookings,
      monthlyRevenue: {} // Placeholder for now, can be added later if needed
    }
  };
};
