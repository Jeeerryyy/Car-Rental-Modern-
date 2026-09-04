import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../api/cars.js';
import { createManualBooking, searchCustomers } from '../api/bookings.js';
import toast from 'react-hot-toast';

export default function AddBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [formData, setFormData] = useState({
    customer: { name: '', email: '', phone: '', address: '', drivingLicenceNumber: '', aadhaarNumber: '' },
    booking: {
      carId: '',
      startDate: '',
      pickupTime: '10:00',
      endDate: '',
      returnTime: '10:00',
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

  // Close search results dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };
    if (showCustomerDropdown) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showCustomerDropdown]);

  const handleCustomerSearch = async (val) => {
    setCustomerSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const res = await searchCustomers(val);
        setCustomerSearchResults(res.data.data || res.data || []);
        setShowCustomerDropdown(true);
      } catch (err) {
        console.error('Failed to search customers:', err);
      }
    } else {
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        name: cust.name || '',
        email: cust.email?.includes('@modern-selfdrive.local') ? '' : (cust.email || ''),
        phone: cust.phone ? cust.phone.replace(/\D/g, '').slice(-10) : '',
        address: cust.address || '',
        drivingLicenceNumber: cust.drivingLicenceNumber || '',
        aadhaarNumber: cust.aadhaarNumber || ''
      }
    }));
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
    setShowCustomerDropdown(false);
    toast.success(`Filled details for ${cust.name}`);
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

    const startDateTime = new Date(`${formData.booking.startDate}T${formData.booking.pickupTime}`);
    const endDateTime = new Date(`${formData.booking.endDate}T${formData.booking.returnTime}`);
    if (endDateTime <= startDateTime) {
      toast.error('Return date & time must be later than pickup date & time');
      return;
    }
    
    setLoading(true);
    try {
      const bookingPayload = {
        ...formData.booking,
        startDate: `${formData.booking.startDate}T${formData.booking.pickupTime}`,
        endDate: `${formData.booking.endDate}T${formData.booking.returnTime}`,
      };
      await createManualBooking({ customer: formData.customer, booking: bookingPayload });
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

          {/* Dedicated Customer Search Box */}
          <div className="relative mb-6 pb-6 border-b border-outline-variant" id="customer-search-container">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">Search Existing Customer (Phone or Name)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
                <input
                  type="text"
                  placeholder="Type phone number or name to search..."
                  value={customerSearchQuery}
                  onChange={e => handleCustomerSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary font-semibold text-primary"
                />
              </div>
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerSearchQuery('');
                    setCustomerSearchResults([]);
                    setShowCustomerDropdown(false);
                  }}
                  className="px-4 py-3 border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {showCustomerDropdown && customerSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 max-h-[220px] overflow-y-auto p-1.5 space-y-0.5">
                <p className="text-[10px] font-bold text-secondary uppercase px-3 py-1 bg-surface-container-low rounded-lg mb-1">Select Customer to Autofill</p>
                {customerSearchResults.map(cust => (
                  <button
                    key={cust._id}
                    type="button"
                    onClick={() => handleSelectCustomer(cust)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-primary">{cust.name}</p>
                      <p className="text-[10px] text-secondary">{cust.phone} {cust.email ? `• ${cust.email}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      <span>Autofill</span>
                      <span className="material-symbols-outlined text-xs">input</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showCustomerDropdown && customerSearchResults.length === 0 && customerSearchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-4 text-center">
                <p className="text-xs text-secondary font-semibold">No existing customers found matching "{customerSearchQuery}"</p>
              </div>
            )}
          </div>

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
                onChange={e => {
                  const cleanVal = e.target.value.replace(/\D/g, '');
                  set('customer', { phone: cleanVal });
                }}
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
                {cars.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.make} {c.model} {c.isBooked ? '• [Currently Booked]' : ''} - ₹{c.pricePerDay}/day
                  </option>
                ))}
              </select>

              {(() => {
                const selectedCar = cars.find(c => c._id === formData.booking.carId);
                if (!selectedCar) return null;
                return (
                  <div className="mt-2.5 space-y-1.5">
                    {selectedCar.isBooked && (
                      <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                        <span>Currently booked. Free from: <strong>{selectedCar.nextAvailableDate ? new Date(selectedCar.nextAvailableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Soon'}</strong></span>
                      </div>
                    )}
                    {selectedCar.bookedRanges && selectedCar.bookedRanges.length > 0 && (
                      <div className="text-[11px] text-secondary">
                        <span className="font-bold">Reserved Intervals: </span>
                        {selectedCar.bookedRanges.map((r, i) => (
                          <span key={i} className="inline-block bg-surface-container-high px-2 py-0.5 rounded text-[10.5px] mr-1.5 font-medium">
                            {new Date(r.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(r.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
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
              <label className="block text-sm font-semibold text-dark mb-2">Pickup Time *</label>
              <input type="time" value={formData.booking.pickupTime} required
                onChange={e => set('booking', { pickupTime: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">End Date *</label>
              <input type="date" value={formData.booking.endDate} min={formData.booking.startDate || today} required
                onChange={e => set('booking', { endDate: e.target.value })}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Return Time *</label>
              <input type="time" value={formData.booking.returnTime} required
                onChange={e => set('booking', { returnTime: e.target.value })}
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
