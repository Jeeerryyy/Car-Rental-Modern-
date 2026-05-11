import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/stats.js';
import { getBookings } from '../api/bookings.js';
import { getNotifications } from '../api/notifications.js';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchStats = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        getDashboardStats(),
        getNotifications({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentBookings(statsRes.data.recentBookings || []);
      setNotifications(notifRes.data.data?.notifications || []);
    } catch {
      setStats({ totalRevenue: 0, activeBookings: 0, totalCars: 0, availableCars: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchStats();
        // Optional: show a small toast if it's a new booking
      };

      socket.on('booking:created', (data) => {
        toast.success(`New booking received from ${data.customer?.name || 'a customer'}!`);
        handleUpdate();
      });
      socket.on('booking:status_updated', handleUpdate);
      socket.on('car:updated', handleUpdate);
      socket.on('car:availability_changed', handleUpdate);
      socket.on('notification:received', (notif) => {
        setNotifications(prev => [notif, ...prev.slice(0, 4)]);
      });

      return () => {
        socket.off('booking:created');
        socket.off('booking:status_updated');
        socket.off('car:updated');
        socket.off('car:availability_changed');
        socket.off('notification:received');
      };
    }
  }, [socket]);

  const NOTIFICATION_ICONS = {
    new_booking: 'calendar_today',
    booking_confirmed: 'check_circle',
    booking_cancelled: 'cancel',
    booking_completed: 'done_all',
    review_submitted: 'star',
    kyc_approved: 'verified',
    kyc_rejected: 'warning',
    general: 'bolt',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      <div>
        <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Dashboard</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Overview of your fleet operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 animate-pulse h-24" />
          ))
        ) : (
          <>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <p className="text-on-surface-variant text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-primary mt-1">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <p className="text-on-surface-variant text-sm font-medium">Active Bookings</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.activeBookings || 0}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <p className="text-on-surface-variant text-sm font-medium">Total Cars</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.totalCars || 0}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <p className="text-on-surface-variant text-sm font-medium">Available Cars</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.availableCars || 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-label-large text-on-surface font-semibold">Recent Bookings</h3>
            <Link to="/bookings" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />)}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No recent bookings</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-4 bg-surface rounded-xl hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-bold text-on-surface">{b.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-on-surface-variant">{b.car?.make} {b.car?.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-on-surface">₹{Number(b.totalPrice).toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[b.status] || 'bg-gray-100 text-gray-800'}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-label-large text-on-surface font-semibold">Activity Log</h3>
            <Link to="/notifications" className="text-sm text-primary font-medium hover:underline">Full Log</Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
              <p className="text-sm font-bold">Silence is Golden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(n => (
                <div key={n._id} className="flex gap-4 p-3 rounded-xl hover:bg-surface transition-colors relative group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.read ? 'bg-surface-container text-secondary' : 'bg-primary text-white shadow-md shadow-primary/20'}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {NOTIFICATION_ICONS[n.type] || 'bolt'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm tracking-tight leading-tight mb-0.5 ${n.read ? 'text-secondary' : 'text-on-surface font-bold'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">{n.message}</p>
                    <p className="text-[9px] text-secondary/60 mt-1 uppercase font-bold tracking-tighter">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
