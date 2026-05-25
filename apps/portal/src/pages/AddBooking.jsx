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
    customer: { name: '', email: '', phone: '', address: '', drivingLicenceNumber: '', aadhaarNumber: '' },
    booking: {
      carId: '',
      startDate: '',
      endDate: '',
      paymentStatus: 'paid',
      notes: '',
      securityDeposit: '',
      amountPaid: '',
      documents: {
        aadhaar: { front: null, back: null },
        license: { front: null, back: null }
      }
    }
  });

  const handleFileChange = (field, side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        booking: {
          ...prev.booking,
          documents: {
            ...prev.booking.documents,
            [field]: {
              ...prev.booking.documents?.[field],
              [side]: reader.result
            }
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

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
              <label className="block text-sm font-semibold text-dark mb-2">Phone *</label>
              <input type="tel" value={formData.customer.phone} required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                onChange={e => set('customer', { phone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Driving Licence Number (Optional)</label>
              <input type="text" value={formData.customer.drivingLicenceNumber}
                onChange={e => set('customer', { drivingLicenceNumber: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="GJ1120200000000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Aadhar No (Optional)</label>
              <input type="text" value={formData.customer.aadhaarNumber}
                onChange={e => set('customer', { aadhaarNumber: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="1234 5678 9012" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Customer Address (Optional)</label>
              <input type="text" value={formData.customer.address}
                onChange={e => set('customer', { address: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="Street, City, Pin Code" />
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Security Deposit (₹)</label>
              <input type="number" value={formData.booking.securityDeposit} min="0"
                onChange={e => set('booking', { securityDeposit: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Amount Paid (₹)</label>
              <input type="number" value={formData.booking.amountPaid} min="0"
                onChange={e => set('booking', { amountPaid: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" placeholder="0" />
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

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
          <h3 className="font-label-large font-semibold text-on-surface">KYC Documents (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aadhaar Card */}
            <div className="border border-outline-variant rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-sm text-dark">Aadhaar Card</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Aadhaar Front */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-on-surface-variant">Front Side</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-surface/50 transition-all min-h-[140px] relative overflow-hidden">
                    {formData.booking.documents.aadhaar.front ? (
                      <>
                        <img src={formData.booking.documents.aadhaar.front} alt="Aadhaar Front Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <svg className="w-8 h-8 text-on-surface-variant mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="block text-xs font-medium text-dark">Upload Front</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange('aadhaar', 'front', e.target.files?.[0])} />
                  </label>
                </div>
                {/* Aadhaar Back */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-on-surface-variant">Back Side</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-surface/50 transition-all min-h-[140px] relative overflow-hidden">
                    {formData.booking.documents.aadhaar.back ? (
                      <>
                        <img src={formData.booking.documents.aadhaar.back} alt="Aadhaar Back Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <svg className="w-8 h-8 text-on-surface-variant mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="block text-xs font-medium text-dark">Upload Back</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange('aadhaar', 'back', e.target.files?.[0])} />
                  </label>
                </div>
              </div>
            </div>

            {/* Driving License */}
            <div className="border border-outline-variant rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-sm text-dark">Driving License</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* License Front */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-on-surface-variant">Front Side</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-surface/50 transition-all min-h-[140px] relative overflow-hidden">
                    {formData.booking.documents.license.front ? (
                      <>
                        <img src={formData.booking.documents.license.front} alt="License Front Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <svg className="w-8 h-8 text-on-surface-variant mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="block text-xs font-medium text-dark">Upload Front</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange('license', 'front', e.target.files?.[0])} />
                  </label>
                </div>
                {/* License Back */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-on-surface-variant">Back Side</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-surface/50 transition-all min-h-[140px] relative overflow-hidden">
                    {formData.booking.documents.license.back ? (
                      <>
                        <img src={formData.booking.documents.license.back} alt="License Back Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <svg className="w-8 h-8 text-on-surface-variant mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="block text-xs font-medium text-dark">Upload Back</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange('license', 'back', e.target.files?.[0])} />
                  </label>
                </div>
              </div>
            </div>
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
