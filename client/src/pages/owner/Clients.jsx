import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/owner/clients');
        if (res.success) {
          setClients(res.data.clients);
        }
      } catch (err) {
        toast.error('Failed to fetch clients');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const tagColor = (totalBookings) => {
    if (totalBookings >= 10) return 'bg-amber-50 text-amber-700 border-amber-200'; // VIP
    if (totalBookings >= 5) return 'bg-blue-50 text-blue-700 border-blue-200'; // Loyal
    return 'bg-surface-container-highest text-on-surface-variant border-outline-variant'; // Standard
  };

  const getTag = (totalBookings) => {
    if (totalBookings >= 10) return 'VIP';
    if (totalBookings >= 5) return 'Loyal';
    return 'Standard';
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Client Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your client relationships and track booking history.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, icon: 'people' },
          { label: 'Active', value: clients.filter(c => c.status === 'active').length, icon: 'verified' },
          { label: 'VIP Clients', value: clients.filter(c => c.totalBookings >= 10).length, icon: 'star' },
          { label: 'Avg Bookings', value: clients.length ? (clients.reduce((acc, c) => acc + c.totalBookings, 0) / clients.length).toFixed(1) : 0, icon: 'trending_up' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-primary text-lg">{isLoading ? '-' : stat.value}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-0 focus:outline-none transition-colors"
            placeholder="Search clients..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface text-on-surface-variant font-label-caps text-label-caps">
                <th className="py-4 px-6 font-semibold">Client</th>
                <th className="py-4 px-6 font-semibold">Tag</th>
                <th className="py-4 px-6 font-semibold">Bookings</th>
                <th className="py-4 px-6 font-semibold">Total Spend</th>
                <th className="py-4 px-6 font-semibold">Last Booking</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-secondary">No clients found.</td>
                </tr>
              ) : filteredClients.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="font-medium text-primary">{c.name || 'Unknown'}</div>
                        <div className="text-on-surface-variant font-body-sm text-body-sm">{c.email || c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-caps text-label-caps border ${tagColor(c.totalBookings)}`}>{getTag(c.totalBookings)}</span>
                  </td>
                  <td className="py-4 px-6">{c.totalBookings}</td>
                  <td className="py-4 px-6 font-medium">{formatCurrency(c.totalSpent)}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{formatDate(c.lastBookingDate)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-caps text-label-caps border ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-on-surface-variant'}`}></span>
                      {c.status || 'active'}
                    </span>
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
