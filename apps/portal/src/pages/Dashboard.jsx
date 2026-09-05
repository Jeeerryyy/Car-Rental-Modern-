import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/stats.js';
import { getBookings } from '../api/bookings.js';
import { getNotifications } from '../api/notifications.js';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import WhatsAppBookingModal from '../components/common/WhatsAppBookingModal.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsAppModalBooking, setWhatsAppModalBooking] = useState(null);
  const socket = useSocket();

  // Booking search on dashboard state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearching(false);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setHasSearched(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getBookings({ search: trimmed, limit: 10 });
        setSearchResults(res.data.data || res.data || []);
      } catch (err) {
        console.error('Failed to search bookings on dashboard:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        getDashboardStats(),
        getNotifications({ limit: 5 })
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setRecentBookings(statsRes.data.data?.recentBookings || statsRes.data.recentBookings || []);
      setNotifications(notifRes.data.data?.notifications || notifRes.data.notifications || []);
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
              <p className="text-on-surface-variant text-sm font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.totalCars || 0}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <p className="text-on-surface-variant text-sm font-medium">Available Vehicles</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.availableCars || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Booking Lookup Widget on Dashboard */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-label-large font-bold text-primary flex items-center gap-2 text-base">
              <span className="material-symbols-outlined text-primary text-xl">search</span>
              Search Any Booking
            </h3>
            <p className="text-xs text-on-surface-variant">Find bookings instantly from the database by customer name, phone number, vehicle, or booking ID</p>
          </div>
          {searchQuery && (
            <Link
              to={`/bookings?q=${encodeURIComponent(searchQuery)}`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage in Bookings Page</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
            person_search
          </span>
          <input
            type="text"
            placeholder="Type customer name or mobile number (e.g. Rahul, 98765...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60 shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container transition-colors"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="mt-4 pt-4 border-t border-outline-variant space-y-2">
            {searching ? (
              <div className="flex items-center justify-center py-6 text-xs text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Searching database for bookings...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-6 text-xs text-on-surface-variant bg-surface rounded-xl border border-outline-variant/40">
                No bookings found matching "<strong className="text-primary">{searchQuery}</strong>".
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium px-1">
                  <span>Found {searchResults.length} matching {searchResults.length === 1 ? 'booking' : 'bookings'}</span>
                  <Link to={`/bookings?q=${encodeURIComponent(searchQuery)}`} className="text-primary font-bold hover:underline">
                    View in Bookings Management →
                  </Link>
                </div>
                {searchResults.filter(Boolean).map(b => (
                  <Link
                    key={b?._id || Math.random()}
                    to={`/bookings?q=${encodeURIComponent(b?.customer?.phone || b?.phone || b?.customer?.name || '')}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-surface hover:bg-surface-container-low border border-outline-variant/60 rounded-xl hover:border-primary/40 transition-all gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-primary group-hover:text-primary/80">{b?.customer?.name || 'Customer'}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[b?.status] || 'bg-gray-100 text-gray-800'}`}>
                          {b?.status}
                        </span>
                        {b?.referenceId && (
                          <span className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant font-mono font-semibold">
                            {b.referenceId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="flex items-center gap-1 font-medium text-on-surface">
                          <span className="material-symbols-outlined text-[13px] text-primary">call</span>
                          {b?.phone || b?.customer?.phone || 'No phone'}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-on-surface">{b?.car?.make} {b?.car?.model}</span>
                        <span>·</span>
                        <span>{b?.startDate ? new Date(b.startDate).toLocaleDateString() : ''} – {b?.endDate ? new Date(b.endDate).toLocaleDateString() : ''}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setWhatsAppModalBooking(b);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Send WhatsApp Reminder or Dispatch Notice"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </button>
                        <p className="font-bold text-sm text-primary">₹{Number(b?.totalPrice || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        {b?.paymentStatus === 'pay_at_car' ? 'Pay at Car' : b?.paymentStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
              {recentBookings.filter(Boolean).map(b => (
                <div key={b?._id || Math.random()} className="flex items-center justify-between p-4 bg-surface rounded-xl hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-bold text-on-surface">{b?.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-on-surface-variant">{b?.car?.make} {b?.car?.model}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWhatsAppModalBooking(b)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Send WhatsApp Message"
                    >
                      <span>💬</span>
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                    <div className="text-right">
                      <p className="font-bold text-on-surface">₹{Number(b?.totalPrice || 0).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[b?.status] || 'bg-gray-100 text-gray-800'}`}>{b?.status}</span>
                    </div>
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
              {notifications.filter(Boolean).map(n => (
                <div key={n?._id || Math.random()} className="flex gap-4 p-3 rounded-xl hover:bg-surface transition-colors relative group">
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
      {/* WhatsApp Booking Dispatch & Notification Modal */}
      <WhatsAppBookingModal
        isOpen={!!whatsAppModalBooking}
        onClose={() => setWhatsAppModalBooking(null)}
        booking={whatsAppModalBooking}
      />
    </div>
  );
}
