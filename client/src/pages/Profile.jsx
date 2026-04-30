import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookingCard from '../components/ui/BookingCard';

const Profile = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/bookings/my');
        setBookings(res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if(!window.confirm('Cancel this reservation?')) return;
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      const res = await api.get('/api/bookings/my');
      setBookings(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const filteredBookings = filterTab === 'All' ? bookings : bookings.filter(b => b.status === filterTab);

  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-[var(--radius-md)] p-8 shadow-sm border border-border text-center">
            <div className="w-24 h-24 bg-dark text-white rounded-full flex items-center justify-center font-display text-4xl font-bold mx-auto mb-4">{user?.name?.charAt(0).toUpperCase()}</div>
            <h2 className="font-display text-2xl font-bold text-dark">{user?.name}</h2>
            <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider mt-2 mb-6 border border-yellow-200">{user?.membershipTier} Member</div>
            <div className="text-left space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-sm text-dark font-medium"><span className="material-symbols-outlined text-muted">mail</span> {user?.email}</div>
              {user?.phone && <div className="flex items-center gap-3 text-sm text-dark font-medium"><span className="material-symbols-outlined text-muted">call</span> {user?.phone}</div>}
              {user?.licenseNumber && <div className="flex items-center gap-3 text-sm text-dark font-medium"><span className="material-symbols-outlined text-muted">badge</span> {user?.licenseNumber}</div>}
              {user?.aadhaarVerified && <div className="flex items-center gap-3 text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit"><span className="material-symbols-outlined text-[18px]">verified_user</span> Aadhaar Verified</div>}
            </div>
          </div>
          <div className="bg-white rounded-[var(--radius-md)] shadow-sm border border-border overflow-hidden">
            <button disabled title="Coming soon" className="w-full flex items-center justify-between p-4 text-sm font-semibold text-dark border-b border-border opacity-60 cursor-not-allowed"><span className="flex items-center gap-3"><span className="material-symbols-outlined text-muted">payment</span> Payment Methods <span className="text-xs text-muted ml-1">(soon)</span></span><span className="material-symbols-outlined text-muted">chevron_right</span></button>
            <button disabled title="Coming soon" className="w-full flex items-center justify-between p-4 text-sm font-semibold text-dark border-b border-border opacity-60 cursor-not-allowed"><span className="flex items-center gap-3"><span className="material-symbols-outlined text-muted">security</span> Security Settings <span className="text-xs text-muted ml-1">(soon)</span></span><span className="material-symbols-outlined text-muted">chevron_right</span></button>
            <button onClick={logout} className="w-full flex items-center justify-between p-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"><span className="flex items-center gap-3"><span className="material-symbols-outlined">logout</span> Sign Out</span></button>
          </div>
          <div className="bg-dark rounded-[var(--radius-md)] p-6 text-white text-center">
            <span className="material-symbols-outlined text-[32px] text-yellow-400 mb-2">loyalty</span>
            <h3 className="font-bold text-lg mb-2">Refer & Earn</h3>
            <p className="text-sm text-gray-300 mb-4">Invite friends and get ₹500 off your next booking.</p>
            <button disabled title="Coming soon" className="w-full py-2 bg-white/40 text-white font-bold text-sm rounded cursor-not-allowed opacity-70">Get Invite Link (soon)</button>
          </div>
        </aside>
        {/* Right Main Area */}
        <main id="main-content" className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="font-display text-3xl font-bold text-dark">My Bookings</h1>
            <div className="flex bg-white rounded-md border border-border p-1">
              {['All', 'Upcoming', 'Active', 'Completed'].map(tab => (
                <button key={tab} onClick={() => setFilterTab(tab)} className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${filterTab === tab ? 'bg-dark text-white' : 'text-muted hover:text-dark'}`}>{tab}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-dark border-t-transparent rounded-full animate-spin"></div></div>
          ) : filteredBookings.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredBookings.map(b => (<BookingCard key={b._id} booking={b} onCancel={handleCancel} />))}
              <div className="mt-8 bg-white border border-dashed border-gray-400 rounded-[var(--radius-md)] p-8 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-muted mb-3">add_circle</span>
                <h3 className="font-bold text-lg text-dark mb-2">Plan Your Next Trip</h3>
                <p className="text-sm text-muted mb-4 max-w-sm">Discover new destinations with our expanding fleet.</p>
                <Link to="/cars" className="btn-outline !py-2 !px-6">Browse Fleet</Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[var(--radius-md)] p-12 text-center border border-border shadow-sm">
              <span className="material-symbols-outlined text-5xl text-muted mb-4 block">event_busy</span>
              <h3 className="font-display text-2xl font-bold text-dark mb-2">No {filterTab.toLowerCase()} bookings</h3>
              <p className="text-muted mb-6">You don't have any {filterTab.toLowerCase()} reservations.</p>
              <Link to="/cars" className="btn-primary inline-flex">Explore Vehicles</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
