import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getNotifications, markAsRead as markOneRead, markAllAsRead as markAllReadApi } from '../api/notifications.js';
import { useSocket } from './SocketContext';
import { useOwnerAuth } from './OwnerAuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useOwnerAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      const data = res.data;
      setNotifications(Array.isArray(data.data) ? data.data : []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      console.log('[Socket] Initializing listeners...');
      
      socket.on('connect', () => {
        console.log('[Socket] Connected successfully');
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
      });

      const handleNewNotification = (notification) => {
        console.log('[Socket] New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Show Toast
        toast.success((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">{notification.title}</span>
            <span className="text-xs text-gray-500 line-clamp-2">{notification.message}</span>
          </div>
        ), {
          duration: 6000,
          icon: '🚗',
        });

        // Browser Native Notification
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      };

      socket.on('notification:received', handleNewNotification);
      return () => {
        console.log('[Socket] Cleaning up listeners...');
        socket.off('notification:received', handleNewNotification);
        socket.off('connect');
        socket.off('connect_error');
      };
    }
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await markOneRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
