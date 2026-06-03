import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

function MyBookings() {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try { const res = await bookingAPI.getMyBookings(); setBookings(res.data.data || []); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!customer) { navigate('/signin'); return; } fetchBookings(); }, [customer, navigate]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);


  const handleCancel = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try { await bookingAPI.cancel(id); toast.success('Booking cancelled'); fetchBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cancellation failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center" style={{ background: '#F4F1EA' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,18,0.15)', borderTopColor: '#121212' }}></div>
      </div>
    );
  }

  const statusBadgeStyle = (status) => {
    const map = {
      pending: { background: '#D6D0C7', color: '#9B6A3C' },
      confirmed: { background: '#DDE8DE', color: '#121212' },
      active: { background: '#DDE8DE', color: '#556B57' },
      completed: { background: '#E7E0D4', color: '#5C5C5C' },
      cancelled: { background: '#F0D9D6', color: '#9C4B45' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="min-h-screen pb-24 pt-32 px-6" style={{ background: '#F4F1EA' }}>
      <SEO title="My Bookings | Modern Selfdrive" />
      <div className="max-w-[800px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="text-left">
            <div className="mb-6 flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tighter uppercase leading-none" style={{ color: '#121212' }}>Modern</span>
              <span className="text-base font-bold tracking-[0.2em] uppercase leading-none ml-0.5" style={{ color: '#A56A43' }}>Selfdrive</span>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#121212' }}>My Bookings</h1>
            <p className="text-sm" style={{ color: '#5C5C5C' }}>Manage and track your car rental history.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-2 rounded-[12px] mb-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors"
              style={filter === s ? { background: '#121212', color: '#FFFFFF' } : { color: '#5C5C5C' }}>
              {s}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-[12px] p-20 text-center" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: '#E7E0D4' }}>🚗</div>
            <p className="font-medium mb-8" style={{ color: '#5C5C5C' }}>You don't have any bookings in this category.</p>
            <Link to="/cars" className="btn-primary inline-flex px-10">Browse Fleet</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="relative">
                <Link to={`/my-bookings/${booking._id}`} className="block rounded-[12px] p-5 no-underline" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-18 rounded-[8px] p-2 overflow-hidden flex-shrink-0" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                      <img src={booking.car?.images?.[0]?.url || '/no-car.png'} alt="" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold truncate" style={{ color: '#121212' }}>{booking.car?.make} {booking.car?.model}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter" style={statusBadgeStyle(booking.status)}>{booking.status}</span>
                      </div>
                      {booking.status === 'cancelled' && booking.cancelledBy === 'owner' && booking.cancellationReason && (
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#9C4B45' }}>
                          Cancelled by owner: {
                            { invalid_documents: 'Invalid Documents', vehicle_not_available: 'Vehicle Not Available', customer_no_show: 'Customer No-Show', payment_issue: 'Payment Issue', other: booking.cancellationNote || 'Other' }[booking.cancellationReason] || booking.cancellationReason
                          }
                        </p>
                      )}
                      <p className="text-xs font-medium" style={{ color: '#5C5C5C' }}>
                        {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block mr-4">
                      <p className="font-bold" style={{ color: '#121212' }}>₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter mt-1" style={{ color: '#5C5C5C' }}>Total Paid</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button onClick={(e) => handleCancel(e, booking._id)} className="px-3 py-1.5 text-[10px] font-bold rounded-[6px]" style={{ background: '#F0D9D6', color: '#9C4B45' }}>Cancel</button>
                      )}
                      <div className="self-end p-2 rounded-full" style={{ background: '#E7E0D4', color: '#121212' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
