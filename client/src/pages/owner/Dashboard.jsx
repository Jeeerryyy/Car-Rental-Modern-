import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    kpis: { totalRevenue: 0, activeBookings: 0, totalCars: 0, availableCars: 0 },
    recentBookings: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/owner/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Utilization calculation
  const utilPercent = stats.kpis.totalCars > 0 
    ? Math.round(((stats.kpis.totalCars - stats.kpis.availableCars) / stats.kpis.totalCars) * 100) 
    : 0;
  const dashOffset = 283 - (283 * utilPercent) / 100;

  if (isLoading) {
    return (
      <div className="p-6 md:p-12 flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 flex flex-col gap-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary font-light tracking-tight mb-2">Overview</h2>
          <p className="font-body-md text-body-md text-secondary">Your fleet's performance at a glance.</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors">notifications</span>
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center text-primary font-bold text-xs">MS</div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Bookings */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Active Bookings</span>
            <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-fixed rounded-full p-2" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary font-light">{stats.kpis.activeBookings}</span>
          </div>
        </div>
        {/* Cars in Fleet */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Cars in Fleet</span>
            <span className="material-symbols-outlined text-primary bg-surface-variant rounded-full p-2" style={{ fontVariationSettings: "'FILL' 1" }}>garage</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary font-light">{stats.kpis.totalCars}</span>
            <span className="font-body-sm text-body-sm text-secondary">{stats.kpis.totalCars - stats.kpis.availableCars} on rent</span>
          </div>
        </div>
        {/* Revenue */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Total Revenue</span>
            <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-fixed rounded-full p-2" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary font-light">{formatCurrency(stats.kpis.totalRevenue)}</span>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Bookings Feed */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-lg text-headline-lg text-primary">Live Bookings Feed</h3>
            <button className="font-label-caps text-label-caps text-primary border border-primary rounded-full px-4 py-1 hover:bg-surface-variant transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-secondary font-label-caps text-label-caps uppercase tracking-wider">
                  <th className="py-3 px-2 font-semibold">Client</th>
                  <th className="py-3 px-2 font-semibold">Vehicle</th>
                  <th className="py-3 px-2 font-semibold">Status</th>
                  <th className="py-3 px-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="font-data-tabular text-data-tabular">
                {stats.recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-secondary">No recent bookings found.</td>
                  </tr>
                ) : stats.recentBookings.map((row, i) => (
                  <tr key={row._id} className={`${i < stats.recentBookings.length - 1 ? 'border-b border-outline-variant' : ''} hover:bg-surface-container-low transition-colors group`}>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-xs">
                          {row.customer?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span className="text-primary group-hover:text-primary-container">{row.customer?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-secondary">{row.car?.make} {row.car?.model}</td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full font-label-caps text-label-caps inline-block text-center w-24 ${
                        row.status === 'active' || row.status === 'completed' 
                          ? 'bg-[#1b1c1c] text-white' 
                          : 'bg-surface-variant text-primary border border-outline-variant'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right text-secondary">{formatCurrency(row.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Fleet Utilization Gauge */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col items-center justify-center relative min-h-[240px]">
            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest absolute top-6 left-6">Fleet Utilization</h3>
            <div className="relative w-40 h-40 mt-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0eee8" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#262626" strokeWidth="6" strokeDasharray="283" strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                <span className="font-headline-xl text-headline-xl text-primary font-light">{utilPercent}%</span>
                <span className="font-label-caps text-label-caps text-secondary">Rented</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
