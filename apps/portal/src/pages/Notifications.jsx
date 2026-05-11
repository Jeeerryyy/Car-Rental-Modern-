import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead as markOneRead, markAllAsRead as markAllReadApi } from '../api/notifications.js';
import { useSocket } from '../context/SocketContext';

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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('notification:received', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      });

      return () => socket.off('notification:received');
    }
  }, [socket]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.data?.notifications || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markOneRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl p-5 animate-pulse">
            <div className="h-4 w-3/4 bg-surface-container rounded mb-2" />
            <div className="h-3 w-1/2 bg-surface-container rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-dark tracking-tight">Activity Log</h1>
          <p className="text-muted font-medium mt-2">Real-time updates from your fleet and operations.</p>
        </div>
        {hasUnread && (
          <button onClick={handleMarkAllAsRead}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-dark transition-colors border-b-2 border-transparent hover:border-dark pb-1">
            Acknowledge All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-border border-dashed py-24 text-center">
          <div className="w-20 h-20 bg-off rounded-full flex items-center justify-center mx-auto mb-6 text-muted/30">
            <span className="material-symbols-outlined text-4xl">notifications_off</span>
          </div>
          <h3 className="text-xl font-bold text-dark mb-1">Silence is Golden</h3>
          <p className="text-sm text-muted font-medium">You've acknowledged all recent activities.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {notifications.map(n => (
            <div key={n._id}
              onClick={() => !n.read && handleMarkAsRead(n._id)}
              className={`group bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                n.read ? 'border-border opacity-70 hover:opacity-100' : 'border-dark shadow-xl shadow-dark/5 ring-4 ring-dark/5'
              }`}>
              <div className="flex items-start gap-4 md:gap-6 relative z-10">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  n.read ? 'bg-off text-muted' : 'bg-dark text-white shadow-lg'
                }`}>
                  <span className="material-symbols-outlined text-xl md:text-2xl">
                    {NOTIFICATION_ICONS[n.type] || 'bolt'}
                  </span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm md:text-base tracking-tight leading-tight ${n.read ? 'text-muted font-medium' : 'text-dark font-black'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">New</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted mb-1 line-clamp-2 md:line-clamp-none">{n.message}</p>
                  <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity self-center">
                  <span className="material-symbols-outlined text-muted">chevron_right</span>
                </div>
              </div>
              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-dark" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
