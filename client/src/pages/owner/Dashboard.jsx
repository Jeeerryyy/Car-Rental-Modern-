import { useState, useEffect } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import { RefreshIcon, StarIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStats();

    const handleUpdate = () => {
      fetchStats();
    };

    socket.on('booking-created', handleUpdate);
    socket.on('booking-updated', handleUpdate);
    socket.on('booking-cancelled', handleUpdate);
    socket.on('booking-completed', handleUpdate);
    socket.on('car-created', handleUpdate);
    socket.on('car-updated', handleUpdate);
    socket.on('car-deleted', handleUpdate);

    return () => {
      socket.off('booking-created', handleUpdate);
      socket.off('booking-updated', handleUpdate);
      socket.off('booking-cancelled', handleUpdate);
      socket.off('booking-completed', handleUpdate);
      socket.off('car-created', handleUpdate);
      socket.off('car-updated', handleUpdate);
      socket.off('car-deleted', handleUpdate);
    };
  }, []);

  const fetchStats = async () => {
    try {
      if (!syncing) setLoading(true);
      const res = await api.get('/api/admin/analytics');
      setStats(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = () => {
    setSyncing(true);
    fetchStats();
    toast.success('Synced');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading && !syncing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Command Center
            <span className="flex h-2 w-2 relative mt-0.5" title="Live Sync Active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h1>
          <p className="text-[10px] text-gray-500 font-medium">Real-time performance metrics</p>
        </div>
        <button 
          onClick={handleSync}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900"
          title="Sync Data"
        >
          <RefreshIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Small Minimalist Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats?.revenueTotal)}</p>
        </div>
        {/* Active */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Bookings</p>
          <p className="text-lg font-bold text-gray-900">{stats?.activeBookingsCount || 0}</p>
        </div>
        {/* Utilization */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fleet Utilization</p>
          <p className="text-lg font-bold text-gray-900">{stats?.fleetUtilization || 0}%</p>
        </div>
        {/* Customers */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Customers</p>
          <p className="text-lg font-bold text-gray-900">{stats?.totalUsers || 0}</p>
        </div>
        {/* Inventory */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Inventory Size</p>
          <p className="text-lg font-bold text-gray-900">{stats?.totalCars || 0}</p>
        </div>
        {/* On Road */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">On Road</p>
          <p className="text-lg font-bold text-blue-600">
            {Math.round((stats?.totalCars || 0) * (stats?.fleetUtilization || 0) / 100)}
          </p>
        </div>
        {/* Flow */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Flow</p>
          <p className="text-lg font-bold text-gray-900">{stats?.totalBookings || 0}</p>
        </div>
        {/* Satisfaction */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Satisfaction</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-bold text-amber-500">{stats?.avgRating || '5.0'}</p>
            <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Activity Log - Minimal */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-tighter">Ref</th>
                <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-tighter">Customer</th>
                <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-tighter">Vehicle</th>
                <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-tighter">Value</th>
                <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-tighter">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentBookings?.slice(0, 5).map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">#{b.confirmationNumber || b._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-bold text-gray-700">{b.clientName}</td>
                  <td className="px-4 py-3 text-gray-500">{b.vehicle}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] font-bold ${
                      b.status === 'Active' ? 'text-blue-600' : 
                      b.status === 'Completed' ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {b.status?.toUpperCase()}
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
};

export default OwnerDashboard;