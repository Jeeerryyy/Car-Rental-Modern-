import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../api/cars.js';
import { createManualBooking } from '../api/bookings.js';
import toast from 'react-hot-toast';

export default function AddBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    customer: { name: '', email: '', phone: '' },
    booking: { carId: '', startDate: '', endDate: '', paymentStatus: 'paid', notes: '' }
  });

  useEffect(() => {
    getCars({ page: 1, limit: 100 }).then(res => {
      // API returns { success: true, data: [cars...] }
      setCars(res.data.data || res.data.cars || []);
    }).catch((err) => {
      console.error('Failed to fetch cars:', err);
    });
  }, []);

  const set = (path, val) => setFormData(p => ({ ...p, [path]: { ...p[path], ...val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.booking.carId || !formData.booking.startDate || !formData.booking.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!formData.customer.name) {
      toast.error('Customer name is required');
      return;
    }
    
    setLoading(true);
    try {
      await createManualBooking({ customer: formData.customer, booking: formData.booking });
      toast.success('Booking created');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 lg:p-12 max-w-[1000px] mx-auto w-full pb-24 md:pb-6">
      <div className="mb-8">
        <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Add Offline Booking</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Register walk-in customer bookings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
          <h3 className="font-label-large font-semibold text-on-surface">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Customer Name *</label>
              <input type="text" value={formData.customer.name} required
                onChange={e => set('customer', { name: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Email (Optional)</label>
              <input type="email" value={formData.customer.email}
                onChange={e => set('customer', { email: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="customer@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Phone</label>
              <input type="tel" value={formData.customer.phone}
                onChange={e => set('customer', { phone: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="+91 9876543210" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
          <h3 className="font-label-large font-semibold text-on-surface">Booking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Select Car *</label>
              <select value={formData.booking.carId} required
                onChange={e => set('booking', { carId: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary">
                <option value="">Select a car</option>
                {cars.map(c => <option key={c._id} value={c._id}>{c.make} {c.model} - ₹{c.pricePerDay}/day</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Payment Status</label>
              <select value={formData.booking.paymentStatus}
                onChange={e => set('booking', { paymentStatus: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Start Date *</label>
              <input type="date" value={formData.booking.startDate} min={today} required
                onChange={e => set('booking', { startDate: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">End Date *</label>
              <input type="date" value={formData.booking.endDate} min={formData.booking.startDate || today} required
                onChange={e => set('booking', { endDate: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-dark mb-2">Additional Notes (Optional)</label>
            <textarea value={formData.booking.notes}
              onChange={e => set('booking', { notes: e.target.value })}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary min-h-[100px]"
              placeholder="Enter any additional details, ID proof info, or special requests..." />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/bookings')} className="px-6 py-3 border border-outline-variant rounded-xl font-semibold hover:bg-surface transition-colors">Cancel</button>
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-dark text-white rounded-xl font-black hover:bg-black/90 transition-colors disabled:opacity-50 shadow-lg shadow-dark/20">
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
