import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../api/cars.js';
import { createManualBooking, searchCustomers, lookupCustomerByPhone } from '../api/bookings.js';
import toast from 'react-hot-toast';

export default function AddBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState(null);
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

  const fetchCustomerByPhone = async (phone) => {
    const clean = phone.replace(/\D/g, '');
    const last10 = clean.length >= 10 ? clean.slice(-10) : clean;
    if (last10.length < 10) return;

    setIsLookingUpPhone(true);
    try {
      const res = await lookupCustomerByPhone(last10);
      const data = res.data?.data || res.data;
      if (data?.found && data?.customer) {
        const cust = data.customer;
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer,
            name: cust.name || prev.customer.name,
            email: (cust.email && !cust.email.includes('@modern-selfdrive.local')) ? cust.email : prev.customer.email,
            phone: last10,
            address: cust.address || prev.customer.address,
            drivingLicenceNumber: cust.drivingLicenceNumber || prev.customer.drivingLicenceNumber,
            aadhaarNumber: cust.aadhaarNumber || prev.customer.aadhaarNumber,
          }
        }));
        setReturningCustomer({
          name: cust.name,
          bookingsCount: data.pastBookingsCount || 1,
          lastBookingDate: data.lastBookingDate
        });
        toast.success(`Returning client found: ${cust.name}! Details auto-filled.`);
      } else {
        setReturningCustomer(null);
      }
    } catch (err) {
      console.error('Customer lookup error:', err);
    } finally {
      setIsLookingUpPhone(false);
    }
  };

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

  const handleCustomerSearch = (val) => {
    setCustomerSearchQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length >= 2) {
      setIsSearchingCustomers(true);
      setShowCustomerDropdown(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await searchCustomers(trimmed);
          const list = res.data?.data || res.data || [];
          setCustomerSearchResults(list);
          setShowCustomerDropdown(true);
        } catch (err) {
          console.error('Failed to search customers:', err);
          setCustomerSearchResults([]);
        } finally {
          setIsSearchingCustomers(false);
        }
      }, 250);
    } else {
      setIsSearchingCustomers(false);
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    const cleanP = cust.phone && cust.phone !== 'Not provided' ? cust.phone.replace(/\D/g, '').slice(-10) : '';
    setFormData(prev => ({
      ...prev,
      customer: {
        name: cust.name || '',
        email: cust.email?.includes('@modern-selfdrive.local') ? '' : (cust.email || ''),
        phone: cleanP,
        address: cust.address || '',
        drivingLicenceNumber: cust.drivingLicenceNumber || '',
        aadhaarNumber: cust.aadhaarNumber || ''
      }
    }));
    setReturningCustomer({
      name: cust.name,
      bookingsCount: cust.pastBookingsCount || 1,
      lastBookingDate: cust.lastBookingDate || null
    });
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
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">Search Existing Customer (Phone, Name or DL)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isSearchingCustomers ? 'text-primary animate-spin' : 'text-secondary'}`}>
                  {isSearchingCustomers ? 'progress_activity' : 'search'}
                </span>
                <input
                  type="text"
                  placeholder="Search by phone, name, email or driving licence..."
                  value={customerSearchQuery}
                  onChange={e => handleCustomerSearch(e.target.value)}
                  onFocus={() => {
                    if (customerSearchResults.length > 0) setShowCustomerDropdown(true);
                  }}
                  className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary font-semibold text-primary placeholder:font-normal placeholder:text-outline"
                />
              </div>
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerSearchQuery('');
                    setCustomerSearchResults([]);
                    setShowCustomerDropdown(false);
                    setIsSearchingCustomers(false);
                  }}
                  className="px-4 py-3 border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl z-50 max-h-[280px] overflow-y-auto p-2 space-y-1 divide-y divide-outline-variant/30">
                {isSearchingCustomers && customerSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-secondary text-xs flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm text-primary">progress_activity</span>
                    <span>Searching database...</span>
                  </div>
                ) : customerSearchResults.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center px-3 py-1 bg-surface-container-low rounded-lg mb-1">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Matching Clients ({customerSearchResults.length})</span>
                      <span className="text-[10px] text-outline">Click to Autofill</span>
                    </div>
                    {customerSearchResults.map(cust => (
                      <button
                        key={cust._id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCustomer(cust);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs hover:bg-surface-container-low transition-colors flex justify-between items-center group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-primary group-hover:text-primary transition-colors">{cust.name}</span>
                            {cust.pastBookingsCount > 0 && (
                              <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {cust.pastBookingsCount} {cust.pastBookingsCount === 1 ? 'Booking' : 'Bookings'}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-secondary">
                            {cust.phone && cust.phone !== 'Not provided' && (
                              <span className="font-medium">📞 {cust.phone}</span>
                            )}
                            {cust.email && !cust.email.includes('@modern-selfdrive.local') && (
                              <span>✉️ {cust.email}</span>
                            )}
                            {cust.drivingLicenceNumber && (
                              <span className="bg-surface-container-high px-1.5 py-0.2 rounded text-[10px] text-primary">DL: {cust.drivingLicenceNumber}</span>
                            )}
                          </div>
                          {cust.address && (
                            <p className="text-[10px] text-outline truncate max-w-[400px]">📍 {cust.address}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white px-2.5 py-1.5 rounded-lg transition-all shrink-0 ml-2">
                          <span>Autofill</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : customerSearchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-secondary font-semibold">No existing clients found matching "{customerSearchQuery}"</p>
                    <p className="text-[11px] text-outline mt-0.5">You can proceed to fill in the customer details below</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Returning Customer Detected Notification */}
          {returningCustomer && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-green-950 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-green-950 flex items-center gap-2">
                    <span>Returning Client: {returningCustomer.name}</span>
                    <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {returningCustomer.bookingsCount} Past {returningCustomer.bookingsCount === 1 ? 'Booking' : 'Bookings'}
                    </span>
                  </p>
                  <p className="text-green-700 mt-0.5">
                    Customer details auto-filled from database. You only need to pick car and dates!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReturningCustomer(null);
                  setFormData(prev => ({
                    ...prev,
                    customer: { name: '', email: '', phone: '', address: '', drivingLicenceNumber: '', aadhaarNumber: '' }
                  }));
                  toast('Cleared customer details', { icon: '🧹' });
                }}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-green-300 hover:bg-green-100 font-semibold text-green-900 transition-colors shrink-0"
              >
                Clear / New Client
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-dark">Phone *</label>
                {isLookingUpPhone && (
                  <span className="text-[11px] text-primary font-medium flex items-center gap-1 animate-pulse">
                    <span className="material-symbols-outlined text-xs">sync</span> Checking...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.customer.phone}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Please enter a valid 10-digit phone number"
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                    set('customer', { phone: cleanVal });
                    if (cleanVal.length === 10) {
                      fetchCustomerByPhone(cleanVal);
                    } else if (returningCustomer) {
                      setReturningCustomer(null);
                    }
                  }}
                  onBlur={() => {
                    if (formData.customer.phone.length === 10 && !returningCustomer) {
                      fetchCustomerByPhone(formData.customer.phone);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm bg-surface outline-none transition-colors ${
                    returningCustomer ? 'border-green-500 bg-green-50/20' : 'border-outline-variant focus:border-primary'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {returningCustomer && (
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg pointer-events-none">
                    check_circle
                  </span>
                )}
              </div>
            </div>
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
