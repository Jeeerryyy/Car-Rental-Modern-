import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { 
  MailIcon, 
  PhoneIcon, 
  BadgeIcon, 
  ShieldCheckIcon, 
  FileIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CreditCardIcon, 
  SettingsIcon, 
  LogOutIcon, 
  GiftIcon, 
  ChevronRightIcon,
  CirclePlusIcon,
  CalendarOffIcon,
  TrendingUpIcon,
  CarIcon,
  CalendarIcon,
  VerifiedIcon,
  WarningIcon,
  CheckIcon,
  WhatsAppIcon
} from '../components/ui/Icons';
import BookingCard from '../components/ui/BookingCard';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All');
  const [kycFile, setKycFile] = useState(null);
  const [kycUploading, setKycUploading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelledBooking, setCancelledBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  const handleCancel = async (id, reason) => {
    try {
      const res = await api.patch(`/api/bookings/${id}/cancel`, { reason });
      const cancelledBookingData = res.data;
      const bookingsRes = await api.get('/api/bookings/my');
      setBookings(bookingsRes.data);
      setCancelledBooking(cancelledBookingData);
      setShowRefundModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleKycUpload = async (e) => {
    e.preventDefault();
    if (!kycFile) return;
    
    setKycUploading(true);
    const formData = new FormData();
    formData.append('document', kycFile);

    try {
      const res = await api.post('/api/auth/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('KYC Document uploaded successfully. Status: Pending Review');
      if (user) {
        user.kyc = res.data.kyc;
        localStorage.setItem('user', JSON.stringify(user));
      }
      setKycFile(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setKycUploading(false);
    }
  };

  const filteredBookings = filterTab === 'All' ? bookings : bookings.filter(b => b.status === filterTab);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: '/profile' }} />;
  }

  return (
    <div className="bg-[#fcfbf7] min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        
        {/* Dynamic Personalized Greeting */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[2px] text-muted mb-1">{getGreeting()}, {user?.name?.split(' ')[0]}</p>
          <h2 className="text-3xl font-display font-bold text-dark">Your Hub</h2>
        </div>
        <header className="bg-white rounded-[var(--radius-xl)] border border-border shadow-sm p-8 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-dark text-white rounded-full flex items-center justify-center font-display text-5xl font-bold border-4 border-white shadow-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="font-display text-3xl font-bold text-dark">{user?.name}</h1>
                <span className="bg-dark text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                  {user?.membershipTier || 'Silver'} Member
                </span>
                {user?.kyc?.status === 'approved' && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1">
                    <VerifiedIcon className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-muted flex items-center gap-4 justify-center md:justify-start">
                <span className="flex items-center gap-1.5"><MailIcon className="w-4 h-4" /> {user?.email}</span>
                {user?.phone && <span className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" /> {user?.phone}</span>}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-off px-4 py-2 rounded-lg border border-border">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Member Since</p>
                  <p className="font-bold text-dark">{user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</p>
                </div>
                <div className="bg-off px-4 py-2 rounded-lg border border-border">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Trips</p>
                  <p className="font-bold text-dark">{bookings.length}</p>
                </div>
                <div className="bg-off px-4 py-2 rounded-lg border border-border group hover:border-dark transition-all">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Loyalty Points</p>
                  <p className="font-bold text-accent">{(user?.loyaltyPoints ?? 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Membership Progress (High-End Polish) */}
              <div className="mt-8 max-w-sm">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                  <span className="text-muted">Silver Tier Progress</span>
                  <span className="text-dark">75% to Gold</span>
                </div>
                <div className="h-1.5 w-full bg-off rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-dark w-[75%] rounded-full transition-all duration-1000" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={logout} className="btn-outline !py-3 !px-6 flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50">
                <LogOutIcon className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Activity Area */}
          <div className="flex-1 space-y-10">
            {/* Quick Actions / Status */}
            {user?.kyc?.status !== 'approved' && (
              <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <WarningIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-amber-900">KYC Verification Required</h3>
                  <p className="text-sm text-amber-700">Please upload your driving license to enable self-drive bookings.</p>
                </div>
                <div className="w-full md:w-auto">
                  {user?.kyc?.status === 'pending' ? (
                    <span className="btn-outline !bg-white !border-amber-300 text-amber-700 cursor-default">Verification Pending</span>
                  ) : (
                    <form onSubmit={handleKycUpload} className="flex gap-2">
                       <input 
                        type="file" 
                        id="kyc-upload"
                        className="hidden" 
                        onChange={(e) => setKycFile(e.target.files[0])}
                      />
                      <label htmlFor="kyc-upload" className="btn-primary !bg-amber-600 !border-amber-600 cursor-pointer text-center flex-1 md:flex-none">
                        {kycFile ? kycFile.name : 'Choose File'}
                      </label>
                      <button type="submit" disabled={!kycFile || kycUploading} className="btn-primary">
                        {kycUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl font-bold text-dark">Recent Bookings</h2>
                <div className="flex bg-white rounded-lg border border-border p-1 shadow-sm">
                  {['All', 'Upcoming', 'Completed'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setFilterTab(tab)} 
                      className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${filterTab === tab ? 'bg-dark text-white' : 'text-muted hover:text-dark'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-dark border-t-transparent rounded-full animate-spin"></div></div>
              ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredBookings.map(b => (
                    <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[var(--radius-xl)] p-20 text-center border border-border shadow-sm">
                  <CalendarOffIcon className="w-16 h-16 text-muted/20 mx-auto mb-6" />
                  <h3 className="font-display text-2xl font-bold text-dark mb-2">No Bookings Yet</h3>
                  <p className="text-muted mb-8 max-w-sm mx-auto">Your journey awaits. Explore our premium fleet and book your next drive today.</p>
                  <Link to="/cars" className="btn-primary px-10">Browse Fleet</Link>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar - Perks & Support */}
          <aside className="w-full lg:w-[380px] space-y-8">
             <div className="bg-dark rounded-[var(--radius-xl)] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <GiftIcon className="w-24 h-24" />
              </div>
              <h3 className="font-display text-xl font-bold mb-4 relative z-10">Exclusive Perks</h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5"><CheckIcon className="w-3 h-3 text-emerald-400" /></div>
                  <p className="text-sm text-gray-300">Free cancellation up to 24h before pickup</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5"><CheckIcon className="w-3 h-3 text-emerald-400" /></div>
                  <p className="text-sm text-gray-300">Complimentary 100km fuel credit on 3+ day trips</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5"><CheckIcon className="w-3 h-3 text-emerald-400" /></div>
                  <p className="text-sm text-gray-300">Priority support for Elite members</p>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">View All Rewards</button>
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border p-8 shadow-sm">
              <h3 className="font-display text-xl font-bold text-dark mb-6">Quick Support</h3>
              <div className="space-y-4">
                <a href="tel:+918792492717" className="flex items-center gap-4 p-4 bg-off rounded-xl border border-border hover:border-accent transition-all group">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-border group-hover:bg-dark group-hover:text-white transition-all"><PhoneIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Call Assistance</p>
                    <p className="text-sm font-bold text-dark">+91 87924 92717</p>
                  </div>
                </a>
                <a href="https://wa.me/918792492717" className="flex items-center gap-4 p-4 bg-off rounded-xl border border-border hover:border-emerald-500 transition-all group">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-border group-hover:bg-emerald-500 group-hover:text-white transition-all"><WhatsAppIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">WhatsApp Support</p>
                    <p className="text-sm font-bold text-dark">Instant Resolution</p>
                  </div>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && cancelledBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="bg-red-600 p-3 text-center">
              <h2 className="text-base font-bold text-white">Booking Cancelled</h2>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="font-mono text-sm text-muted">Booking ID: <span className="font-bold text-dark">{cancelledBooking.confirmationNumber}</span></p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Total Paid</span>
                  <span className="font-bold">₹{Number(cancelledBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Security Deposit</span>
                  <span className="font-bold">₹{Number(cancelledBooking.securityDeposit || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold">Total Refund</span>
                  <span className="font-bold text-green-600">₹{Number((cancelledBooking.totalAmount || 0) + (cancelledBooking.securityDeposit || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-xs text-muted text-center mb-4">Refund in 5-7 business days</p>

              <div className="flex gap-2">
                <a href="tel:+918792492717" className="flex-1 py-2 px-3 bg-gray-900 text-white text-xs rounded font-medium text-center">
                  Contact Support
                </a>
                <a href="https://wa.me/918792492717" className="flex-1 py-2 px-3 bg-green-500 text-white text-xs rounded font-medium text-center">
                  WhatsApp
                </a>
                <button onClick={() => setShowRefundModal(false)} className="flex-1 py-2 px-3 border border-border text-dark text-xs rounded font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
