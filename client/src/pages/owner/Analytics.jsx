import { useState, useEffect } from 'react';
import api from '../../services/api';

const Analytics = () => {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, carsRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/cars')
      ]);
      setBookings(bookingsRes.data || []);
      setCars(carsRes.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount || 0);
  };

  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings = bookings.length;
  const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  const getMonthlyRevenue = () => {
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = 0;
    }

    completedBookings.forEach(booking => {
      const date = new Date(booking.createdAt || booking.pickupDate);
      const monthKey = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += booking.totalPrice || 0;
      }
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
  };

  const getCarPerformance = () => {
    const carStats = {};
    
    bookings.forEach(booking => {
      if (!booking.carId) return;
      const carKey = `${booking.carId.make} ${booking.carId.model}`;
      if (!carStats[carKey]) {
        carStats[carKey] = { name: carKey, bookings: 0, revenue: 0, completed: 0 };
      }
      carStats[carKey].bookings++;
      if (booking.status === 'Completed') {
        carStats[carKey].completed++;
        carStats[carKey].revenue += booking.totalPrice || 0;
      }
    });

    return Object.values(carStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getStatusDistribution = () => {
    const statusCounts = {};
    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / bookings.length) * 100) || 0
    }));
  };

  const monthlyData = getMonthlyRevenue();
  const carPerformance = getCarPerformance();
  const statusDistribution = getStatusDistribution();

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'bg-green-500',
      Active: 'bg-blue-500',
      Upcoming: 'bg-purple-500',
      Pending: 'bg-yellow-500',
      Cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900">Revenue Analytics</h1>
        <p className="text-gray-500 mt-1">Track your business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Avg. Booking Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(avgBookingValue)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Fleet Utilization</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {cars.length > 0 ? Math.round((bookings.filter(b => b.status === 'Active').length / cars.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        <div className="h-64 flex items-end gap-2">
          {monthlyData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-dark rounded-t-md transition-all hover:bg-gray-800"
                style={{ height: `${(data.revenue / maxRevenue) * 200}px`, minHeight: data.revenue > 0 ? '8px' : '0' }}
              />
              <p className="text-xs text-gray-500 mt-2">{data.month}</p>
              <p className="text-xs font-medium text-gray-700">{data.revenue > 0 ? formatCurrency(data.revenue) : '₹0'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            {statusDistribution.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings yet</p>
            ) : (
              statusDistribution.map(item => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Cars */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Vehicles</h3>
          <div className="space-y-3">
            {carPerformance.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings yet</p>
            ) : (
              carPerformance.map((car, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{car.name}</p>
                    <p className="text-xs text-gray-500">{car.completed} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(car.revenue)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Revenue Breakdown</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Count</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Avg. Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-5 py-4 text-sm text-gray-900">Completed</td>
              <td className="px-5 py-4 text-sm text-gray-600">{completedBookings.length}</td>
              <td className="px-5 py-4 text-sm font-medium text-gray-900">{formatCurrency(totalRevenue)}</td>
              <td className="px-5 py-4 text-sm text-gray-600">{formatCurrency(avgBookingValue)}</td>
            </tr>
            <tr>
              <td className="px-5 py-4 text-sm text-gray-900">Active Rentals</td>
              <td className="px-5 py-4 text-sm text-gray-600">{bookings.filter(b => b.status === 'Active').length}</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
            </tr>
            <tr>
              <td className="px-5 py-4 text-sm text-gray-900">Pending</td>
              <td className="px-5 py-4 text-sm text-gray-600">{bookings.filter(b => b.status === 'Pending').length}</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
            </tr>
            <tr>
              <td className="px-5 py-4 text-sm text-gray-900">Cancelled</td>
              <td className="px-5 py-4 text-sm text-gray-600">{bookings.filter(b => b.status === 'Cancelled').length}</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
              <td className="px-5 py-4 text-sm text-gray-500">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;