import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30 Days');

  // Dummy data for charts
  const revenueData = [
    { name: 'Week 1', revenue: 4000 },
    { name: 'Week 2', revenue: 3000 },
    { name: 'Week 3', revenue: 2000 },
    { name: 'Week 4', revenue: 2780 }
  ];

  const classData = [
    { name: 'SUV', value: 45, color: '#111118' },
    { name: 'Sedan', value: 30, color: '#333333' },
    { name: 'Hatchback', value: 15, color: '#666666' },
    { name: 'Bikes', value: 10, color: '#999999' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        setStats(res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusColors = {
    Upcoming: 'bg-blue-100 text-blue-800',
    Active: 'bg-green-100 text-green-800',
    Completed: 'bg-gray-100 text-gray-800',
    Cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <AdminSidebar>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark mb-1">Performance Analytics</h1>
          <p className="text-sm text-muted">Overview of your rental fleet metrics.</p>
        </div>
        <div className="flex bg-white rounded-md border border-border p-1">
          {['30 Days', '90 Days', 'YTD'].map(tf => (
            <button 
              key={tf} onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${timeframe === tf ? 'bg-dark text-white' : 'text-muted hover:text-dark'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <p className="text-sm text-muted font-bold tracking-wider uppercase mb-2">Total Revenue</p>
              <h3 className="text-3xl font-bold text-dark mb-1">₹{stats?.revenueTotal?.toLocaleString('en-IN') || '0'}</h3>
              <p className="text-xs text-green-600 font-semibold flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5% vs last period</p>
            </div>
            
            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <p className="text-sm text-muted font-bold tracking-wider uppercase mb-2">Active Bookings</p>
              <h3 className="text-3xl font-bold text-dark mb-1">{stats?.activeBookingsCount || 0}</h3>
              <p className="text-xs text-green-600 font-semibold flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +4.2% vs last period</p>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-muted font-bold tracking-wider uppercase">Fleet Utilization</p>
                <span className="text-xl font-bold text-dark">{stats?.fleetUtilization?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-off h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-dark h-full rounded-full" style={{ width: `${stats?.fleetUtilization || 0}%` }}></div>
              </div>
              <p className="text-xs text-muted font-semibold mt-2 text-right">Target: 85%</p>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <p className="text-sm text-muted font-bold tracking-wider uppercase mb-2">Client Satisfaction</p>
              <h3 className="text-3xl font-bold text-dark mb-1 flex items-center gap-1">{stats?.avgRating || '4.9'} <span className="material-symbols-outlined text-yellow-500 text-[28px]">star</span></h3>
              <p className="text-xs text-muted font-semibold mt-1">Based on recent reviews</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <h3 className="font-bold text-dark mb-6">Revenue Growth</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E0DB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B7A', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B7A', fontSize: 12 }} tickFormatter={value => `₹${value}`} />
                    <Tooltip cursor={{fill: '#F6F5F2'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="revenue" fill="#111118" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm">
              <h3 className="font-bold text-dark mb-6">Bookings by Class</h3>
              <div className="flex flex-col gap-5">
                {classData.map(cls => (
                  <div key={cls.name}>
                    <div className="flex justify-between text-sm mb-1 font-semibold">
                      <span className="text-dark">{cls.name}</span>
                      <span className="text-muted">{cls.value}%</span>
                    </div>
                    <div className="w-full bg-off h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cls.value}%`, backgroundColor: cls.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions — Real Data */}
          <div className="bg-white rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-dark">Recent Transactions</h3>
              <span className="text-xs text-muted font-semibold">{stats?.recentBookings?.length || 0} latest</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-off border-b border-border">
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Booking ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Client</th>
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Vehicle</th>
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Dates</th>
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map(b => (
                    <tr key={b._id} className="border-b border-border last:border-0 hover:bg-off/50">
                      <td className="py-4 px-6 text-sm font-mono text-dark">{b.confirmationNumber}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-dark">{b.clientName}</td>
                      <td className="py-4 px-6 text-sm text-muted">{b.vehicle}</td>
                      <td className="py-4 px-6 text-sm text-muted">
                        {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(b.dropoffDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-dark">₹{Number(b.totalPrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-gray-100 text-gray-800'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-muted font-medium">No transactions yet. Bookings will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminSidebar>
  );
};

export default Analytics;
