import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        if (res.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        toast.error('Failed to fetch bookings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusPill = (status) => {
    const map = {
      'active':      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'pending':     'bg-blue-100 text-blue-800 border-blue-200',
      'confirmed':   'bg-blue-100 text-blue-800 border-blue-200',
      'completed':   'bg-surface-container-highest text-on-surface-variant border-outline-variant',
      'cancelled':   'bg-error-container text-on-error-container border-error-container',
    };
    return map[status?.toLowerCase()] || 'bg-surface-variant text-primary border-outline-variant';
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start, end) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diff = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24));
    return `${diff} Day${diff > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Bookings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage reservations, track vehicle status, and handle offline bookings.</p>
        </div>
        <button className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-caps text-label-caps flex justify-center items-center gap-2 hover:bg-surface-tint transition-colors whitespace-nowrap self-start md:self-auto">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          Add Offline Booking
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-transparent border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-0 cursor-pointer w-full md:w-auto min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-body-md">expand_more</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface text-on-surface-variant font-label-caps text-label-caps">
                <th className="py-4 px-6 font-semibold whitespace-nowrap">ID</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap">Customer</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap">Car Details</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap">Pickup &amp; Return</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap">Duration</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-secondary">No bookings found.</td>
                </tr>
              ) : filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-4 px-6 text-on-surface-variant">{b._id.slice(-6).toUpperCase()}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-body-sm text-body-sm shrink-0">
                        {b.customer?.name ? b.customer.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="font-medium text-primary">{b.customer?.name || 'Unknown'}</div>
                        <div className="text-on-surface-variant font-body-sm text-body-sm">{b.customer?.phone || b.customer?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{b.car?.make} {b.car?.model}</div>
                    <div className="text-on-surface-variant font-body-sm text-body-sm">{b.car?.licensePlate}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div>{formatDate(b.startDate)}</div>
                    <div className="text-on-surface-variant font-body-sm text-body-sm">
                      {formatDate(b.endDate)}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getDuration(b.startDate, b.endDate)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-caps text-label-caps border uppercase ${statusPill(b.status)}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
