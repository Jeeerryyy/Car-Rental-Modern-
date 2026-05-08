import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Navigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function MyBookings() {
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/customer/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin?returnTo=/my-bookings" />;
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_approval: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-off py-20 px-6">
      <div className="max-w-[1000px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="font-display text-3xl font-bold text-dark mb-8">My Bookings</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-4xl">car_rental</span>
            </div>
            <h3 className="text-xl font-medium text-dark mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">When you book a car, it will appear here.</p>
            <Link to="/cars" className="btn-primary inline-block">Browse Cars</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    {booking.car?.images?.[0] && (
                      <img 
                        src={booking.car.images[0].url} 
                        alt={booking.car.make} 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-dark">{booking.car?.make} {booking.car?.model}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-sm">{booking.totalDays} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-dark">₹{booking.finalTotal}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                    {booking.invoiceUrl && (
                      <a 
                        href={booking.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mt-2 text-sm text-primary hover:underline"
                      >
                        Download Invoice
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}