import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
      setBookings(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Change booking status to "${newStatus}"?`)) return;
    try {
      await api.patch(`/api/admin/bookings/${id}`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      alert('Error updating booking status');
    }
  };

  const statusColors = {
    Upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-gray-100 text-gray-800 border-gray-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const filtered = filterStatus === 'All' ? bookings : bookings.filter(b => b.status === filterStatus);

  return (
    <AdminSidebar>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark mb-1">Manage Bookings</h1>
          <p className="text-sm text-muted">View and manage all customer reservations.</p>
        </div>
        <div className="flex bg-white rounded-md border border-border p-1">
          {['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${filterStatus === tab ? 'bg-dark text-white' : 'text-muted hover:text-dark'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: 'calendar_month' },
          { label: 'Upcoming', value: bookings.filter(b => b.status === 'Upcoming').length, icon: 'schedule' },
          { label: 'Active', value: bookings.filter(b => b.status === 'Active').length, icon: 'directions_car' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: 'check_circle' }
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-[var(--radius-md)] border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center border border-border">
              <span className="material-symbols-outlined text-dark">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark">{s.value}</p>
              <p className="text-xs text-muted font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-off border-b border-border">
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Ref</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Client</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Vehicle</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Dates</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Amount</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id} className="border-b border-border last:border-0 hover:bg-off/50">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-dark">{b.confirmationNumber}</td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-sm text-dark">{b.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted">{b.userId?.email || ''}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-dark">{b.carId ? `${b.carId.make} ${b.carId.model}` : 'Unknown'}</p>
                    <p className="text-xs text-muted">{b.carId?.licensePlate || ''}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted">
                    {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(b.dropoffDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-dark">₹{Number(b.totalPrice).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[b.status] || 'bg-gray-100 text-gray-800'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {b.status === 'Upcoming' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleStatusChange(b._id, 'Active')} className="text-green-600 hover:text-green-700 text-xs font-bold px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors">
                          Activate
                        </button>
                        <button onClick={() => handleStatusChange(b._id, 'Cancelled')} className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                      </div>
                    )}
                    {b.status === 'Active' && (
                      <button onClick={() => handleStatusChange(b._id, 'Completed')} className="text-dark text-xs font-bold px-2 py-1 rounded bg-off hover:bg-border transition-colors">
                        Complete
                      </button>
                    )}
                    {(b.status === 'Completed' || b.status === 'Cancelled') && (
                      <span className="text-xs text-muted italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-muted font-medium">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminSidebar>
  );
};

export default Bookings;
