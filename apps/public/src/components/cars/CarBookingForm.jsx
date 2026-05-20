import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockIcon, ArrowRightIcon, ShieldIcon, CameraIcon, CheckIcon } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, promoAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import SignaturePad from '../ui/SignaturePad';

export default function CarBookingForm({ car }) {
  if (!car) return null;

  const { customer } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Dates, 2: Docs, 3: Review, 4: Success
  const [bookingData, setBookingData] = useState({ 
    startDate: '', 
    pickupTime: '10:00',
    endDate: '', 
    returnTime: '10:00',
    notes: '', 
    promoCode: '',
    phone: customer?.phone || '',
    pickupLocation: car?.location || ''
  });

  const [bookingRef, setBookingRef] = useState('');

  const [verificationData, setVerificationData] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    licenseFront: null,
    licenseBack: null,
    signature: null
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [payAtCar, setPayAtCar] = useState(false);

  // Load search criteria from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('searchCriteria');
      if (saved) {
        const criteria = JSON.parse(saved);
        if (criteria.from || criteria.to) {
          setBookingData(prev => ({
            ...prev,
            startDate: criteria.from || prev.startDate,
            endDate: criteria.to || prev.endDate
          }));
        }
      }
    } catch (e) {}
  }, []);

  const calculateTotal = () => {
    const p = Number(car?.pricePerDay || 0);
    if (!bookingData.startDate || !bookingData.endDate) return p;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return p;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * p;
  };

  const handlePromoCheck = async () => {
    if (!bookingData.promoCode) return;
    try {
      const res = await promoAPI.validate({ code: bookingData.promoCode, orderValue: calculateTotal() });
      setDiscount(res.data.data.discountAmount || 0);
      toast.success('Promo code applied!');
    } catch (err) {
      setDiscount(0);
      toast.error(err.response?.data?.message || 'Invalid promo code');
    }
  };

  const applyDayPreset = (days) => {
    const start = bookingData.startDate ? new Date(bookingData.startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    
    setBookingData({
      ...bookingData,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const handleProceed = () => {
    if (!customer) {
      toast.error('Please sign in to book a car');
      navigate('/signin', { state: { from: `/car/${car._id}` } });
      return;
    }
    
    if (step === 1) {
      if (!bookingData.startDate || !bookingData.endDate) {
        toast.error('Please select dates');
        return;
      }
      if (!bookingData.phone || bookingData.phone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const { aadhaarFront, aadhaarBack, licenseFront, licenseBack, signature } = verificationData;
      if (!aadhaarFront || !aadhaarBack || !licenseFront || !licenseBack || !signature) {
        toast.error('All documents and signature are required');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalBooking = async () => {
    if (!agreedTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    setIsBooking(true);
    try {
      const { aadhaarFront, aadhaarBack, licenseFront, licenseBack, signature } = verificationData;

      const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const sigFile = dataURLtoFile(signature, 'signature.png');

      const formData = new FormData();
      formData.append('documents', aadhaarFront);
      formData.append('documents', aadhaarBack);
      formData.append('documents', licenseFront);
      formData.append('documents', licenseBack);
      formData.append('documents', sigFile);

      const uploadRes = await uploadAPI.documents(formData);
      const [af, ab, lf, lb, sig] = uploadRes.data.data.files;

      const bookingPayload = {
        carId: car._id,
        startDate: bookingData.startDate,
        pickupTime: bookingData.pickupTime,
        endDate: bookingData.endDate,
        returnTime: bookingData.returnTime,
        phone: bookingData.phone,
        notes: bookingData.notes,
        promoCode: bookingData.promoCode || undefined,
        discountAmount: discount,
        documents: {
          aadhaar: { front: af, back: ab },
          license: { front: lf, back: lb }
        },
        signature: sig
      };

      let booking;
      if (payAtCar) {
        const res = await bookingAPI.createCashBooking(bookingPayload);
        booking = res.data.data.bookingDetails || res.data.data;
        toast.success('Booking confirmed! Pay the full amount at vehicle pickup.');
      } else {
        const res = await bookingAPI.create(bookingPayload);
        booking = res.data.data.booking;
        const { razorpayOrderId, amount } = res.data.data;
        toast.success('Booking initialized!');

        setBookingRef(booking.referenceId || booking._id?.slice(-6).toUpperCase() || 'PENDING');
        setStep(4);

        setTimeout(() => {
          navigate(`/booking-confirmation/${booking._id}`, {
            state: { booking, razorpayOrderId, amount, customer }
          });
        }, 2000);
        setIsBooking(false);
        return;
      }

      setBookingRef(booking.referenceId || booking._id?.slice(-6).toUpperCase() || 'CONFIRMED');
      setStep(4);

      // Add redirection for cash bookings as well
      setTimeout(() => {
        navigate(`/booking-confirmation/${booking._id}`, {
          state: { booking, customer }
        });
      }, 3000);
    } catch (err) {
      console.error('Booking Error:', err);
      toast.error(err.response?.data?.message || 'Failed to process booking');
    } finally {
      setIsBooking(false);
    }
  };

  const total = calculateTotal() - discount;
  const days = bookingData.startDate && bookingData.endDate
    ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) || 1
    : 1;

  const today = new Date().toISOString().split('T')[0];

  const DocumentField = ({ label, value, onChange }) => (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: '#6b5e50' }}>{label}</label>
      <div className="relative h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer"
        style={{ borderColor: value ? '#B67C3D' : 'rgba(182,124,61,0.2)', background: value ? 'rgba(182,124,61,0.05)' : '#EBE6DE' }}>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={e => onChange(e.target.files[0])} />
        {value ? (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: '#B67C3D' }}>
              <CheckIcon className="w-5 h-5" style={{ color: '#F9F8F3' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-full px-2" style={{ color: '#19130E' }}>Uploaded</span>
          </>
        ) : (
          <>
            <CameraIcon className="w-6 h-6 mb-1" style={{ color: '#6b5e50' }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#6b5e50' }}>Tap to Upload</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
      {/* Progress Tracker */}
      <div className="mb-6 sm:mb-10 px-2 sm:px-4">
        <div className="grid grid-cols-4 w-full relative">
          {/* Connecting Line Background */}
          <div className="absolute top-4 left-[12.5%] right-[12.5%] h-[2px]" style={{ background: 'rgba(182,124,61,0.15)' }} />
          
          {[
            { n: 1, label: 'Dates' },
            { n: 2, label: 'Verify' },
            { n: 3, label: 'Pay' },
            { n: 4, label: 'Done' }
          ].map(({ n, label }, i) => (
            <div key={n} className="flex flex-col items-center relative z-10">
              <div className="relative flex items-center justify-center w-full">
                {/* Active/Completed Line */}
                {i > 0 && (
                  <div className="absolute right-[50%] top-1/2 -translate-y-1/2 h-[2px] w-full"
                    style={{ background: step >= n ? '#22c55e' : 'transparent', display: step > i ? 'block' : 'none' }} />
                )}
                
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black relative z-20 transition-all duration-500"
                  style={step === n ? { background: '#B67C3D', borderColor: '#B67C3D', color: '#19130E', transform: 'scale(1.1)' } :
                    step > n ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' } : { background: '#EBE6DE', borderColor: 'rgba(182,124,61,0.15)', color: '#6b5e50' }}>
                  {step > n ? <CheckIcon className="w-4 h-4" /> : n}
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider mt-2 transition-colors duration-500"
                style={{ color: step >= n ? '#19130E' : '#6b5e50' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px -mx-4 sm:-mx-6 lg:-mx-8 mb-6 sm:mb-8" style={{ background: 'rgba(182,124,61,0.1)' }} />

      {/* Step 1: Dates & Times */}
      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#19130E' }}>Select Rental Schedule</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6" style={{ color: '#6b5e50' }}>Choose your preferred dates and pickup point</p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#6b5e50' }}>Quick Select Duration</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3].map(d => (
                <button key={d} onClick={() => applyDayPreset(d)}
                  className="flex flex-col items-center justify-center py-3 sm:py-4 rounded-xl sm:rounded-2xl"
                  style={days === d ? { border: '1px solid #B67C3D', background: 'rgba(182,124,61,0.05)' } : { border: '1px solid rgba(182,124,61,0.15)', background: '#EBE6DE' }}>
                  <span className="text-xl sm:text-2xl font-display font-bold" style={{ color: days === d ? '#B67C3D' : '#19130E' }}>{d}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest" style={{ color: days === d ? '#B67C3D' : '#6b5e50' }}>Day{d > 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#6b5e50' }}>Pickup Date</label>
              <input type="date" min={today} value={bookingData.startDate}
                onChange={e => setBookingData({ ...bookingData, startDate: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#6b5e50' }}>Pickup Time</label>
              <input type="time" value={bookingData.pickupTime}
                onChange={e => setBookingData({ ...bookingData, pickupTime: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#6b5e50' }}>Return Date</label>
              <input type="date" min={bookingData.startDate || today} value={bookingData.endDate}
                onChange={e => setBookingData({ ...bookingData, endDate: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#6b5e50' }}>Return Time</label>
              <input type="time" value={bookingData.returnTime}
                onChange={e => setBookingData({ ...bookingData, returnTime: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }} />
            </div>
          </div>

          {/* Location Selection Grid */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#6b5e50' }}>Pickup Location</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[car.location, 'Railway Station', 'Airport Terminal', 'City Center'].filter((loc, i, self) => self.indexOf(loc) === i).map((loc, i) => (
                <div key={loc} 
                  onClick={() => setBookingData({ ...bookingData, pickupLocation: loc })}
                  className="relative overflow-hidden group p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer"
                  style={bookingData.pickupLocation === loc ? { borderColor: '#B67C3D', background: 'rgba(182,124,61,0.05)' } : { borderColor: 'rgba(182,124,61,0.15)', background: '#EBE6DE' }}>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: bookingData.pickupLocation === loc ? '#B67C3D' : '#6b5e50' }}>
                        {loc === car.location ? 'Primary' : 'Hub'}
                      </span>
                      <span className="text-[13px] font-bold" style={{ color: bookingData.pickupLocation === loc ? '#19130E' : '#6b5e50' }}>
                        {loc}
                      </span>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                      style={bookingData.pickupLocation === loc ? { background: '#B67C3D', color: '#19130E' } : { background: '#F2EEE5', color: '#6b5e50' }}>
                      <ShieldIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  {/* Decorative Background Element */}
                  <div className="absolute -bottom-2 -right-2 text-4xl opacity-5 pointer-events-none">📍</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#6b5e50' }}>Contact Phone Number *</label>
            <input type="tel" value={bookingData.phone} maxLength={10}
              placeholder="Enter 10-digit mobile number"
              onChange={e => setBookingData({ ...bookingData, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-bold outline-none" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }} />
          </div>

          {/* Live Summary */}
          {bookingData.startDate && bookingData.endDate && (
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.2)' }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#6b5e50' }}>
                  <span>Daily Rate</span>
                  <span style={{ color: '#19130E' }}>₹{Number(car?.pricePerDay || 0).toLocaleString('en-IN')} / Day</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#6b5e50' }}>
                  <span>Duration</span>
                  <span style={{ color: '#B67C3D' }}>{days} Day{days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#6b5e50' }}>
                  <span>Location</span>
                  <span className="truncate max-w-[150px]" style={{ color: '#19130E' }}>{bookingData.pickupLocation}</span>
                </div>
                <div className="h-px my-1" style={{ background: 'rgba(182,124,61,0.15)' }} />
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#19130E' }}>Total Rental</span>
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#6b5e50' }}>Balance at pickup: ₹{(total - 500).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-display font-bold" style={{ color: '#19130E' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#B67C3D' }}>Due Now (Advance)</span>
                  <span className="text-lg font-display font-bold" style={{ color: '#B67C3D' }}>₹500</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleProceed}
            className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4"
            style={{ background: '#B67C3D', color: '#19130E' }}>
            <span>Continue to Verification</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#19130E' }}>Identity Verification</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6" style={{ color: '#6b5e50' }}>Upload clear photos of your documents</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <DocumentField label="Aadhaar Front" value={verificationData.aadhaarFront} 
              onChange={val => setVerificationData({ ...verificationData, aadhaarFront: val })} />
            <DocumentField label="Aadhaar Back" value={verificationData.aadhaarBack} 
              onChange={val => setVerificationData({ ...verificationData, aadhaarBack: val })} />
            <DocumentField label="License Front" value={verificationData.licenseFront} 
              onChange={val => setVerificationData({ ...verificationData, licenseFront: val })} />
            <DocumentField label="License Back" value={verificationData.licenseBack} 
              onChange={val => setVerificationData({ ...verificationData, licenseBack: val })} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#6b5e50' }}>Digital Signature</label>
            <SignaturePad 
              defaultValue={verificationData.signature}
              onSave={sig => setVerificationData({ ...verificationData, signature: sig })}
              onClear={() => setVerificationData({ ...verificationData, signature: null })}
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button onClick={() => setStep(1)}
              className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest"
              style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }}>
              Back
            </button>
            <button onClick={handleProceed}
              className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3"
              style={{ background: '#19130E', color: '#F9F8F3' }}>
              <span>Review & Pay</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Terms */}
      {step === 3 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#19130E' }}>Review & Finalize</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6" style={{ color: '#6b5e50' }}>Confirm your booking details and payment</p>
          {/* Summary Card */}
          <div className="rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 overflow-hidden relative" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.2)' }}>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full" style={{ background: 'rgba(182,124,61,0.15)', color: '#B67C3D', border: '1px solid rgba(182,124,61,0.25)' }}>
                      Premium Selection
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-display font-bold leading-tight" style={{ color: '#19130E' }}>{car.make} {car.model}</h4>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#6b5e50' }}>{car.category} • {car.fuelType}</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(182,124,61,0.1)', border: '1px solid rgba(182,124,61,0.2)' }}>
                    <ShieldIcon className="w-6 h-6" style={{ color: '#B67C3D' }} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: '#B67C3D' }}>Secure Booking</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#6b5e50' }}>Pickup</span>
                  <p className="text-[11px] sm:text-xs font-bold" style={{ color: '#19130E' }}>{new Date(bookingData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[9px] sm:text-[10px] truncate" style={{ color: '#6b5e50' }}>{bookingData.pickupTime} • {bookingData.pickupLocation}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#6b5e50' }}>Return</span>
                  <p className="text-[11px] sm:text-xs font-bold" style={{ color: '#19130E' }}>{new Date(bookingData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[9px] sm:text-[10px]" style={{ color: '#6b5e50' }}>{bookingData.returnTime}</p>
                </div>
              </div>

              {/* Signature Preview */}
              <div className="mb-6 sm:mb-8 p-4 rounded-2xl flex items-center gap-4" style={{ background: 'rgba(25,19,14,0.05)', border: '1px solid rgba(182,124,61,0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(182,124,61,0.1)', border: '1px solid rgba(182,124,61,0.2)' }}>
                  <svg className="w-6 h-6" style={{ color: '#B67C3D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#6b5e50' }}>Verified Signature</span>
                  <div className="h-10 w-full bg-white rounded-lg flex items-center justify-center p-1">
                    {verificationData.signature ? (
                      <img src={verificationData.signature} alt="Signature Preview" className="h-full object-contain opacity-80" />
                    ) : (
                      <span className="text-[10px] italic" style={{ color: '#6b5e50' }}>No signature captured</span>
                    )}
                  </div>
                </div>
              </div>


              <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#6b5e50' }}>
                  <span>Rental Rate (x{days} Days)</span>
                  <span style={{ color: '#19130E' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                    <span>Promo Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div className="pt-4">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-3" style={{ color: '#6b5e50' }}>Payment Method</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div onClick={() => setPayAtCar(false)}
                      className="p-4 rounded-xl border cursor-pointer text-center"
                      style={!payAtCar ? { borderColor: '#B67C3D', background: 'rgba(182,124,61,0.12)' } : { borderColor: 'rgba(182,124,61,0.15)', background: 'rgba(255,255,255,0.3)' }}>
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center`}
                        style={!payAtCar ? { borderColor: '#B67C3D', background: '#B67C3D' } : { borderColor: '#6b5e50' }}>
                        {!payAtCar && <div className="w-2 h-2 rounded-full" style={{ background: '#19130E' }} />}
                      </div>
                      <span className="text-[11px] font-black block" style={{ color: '#19130E' }}>Online Pay</span>
                      <span className="text-[9px] font-bold block mt-1" style={{ color: '#6b5e50' }}>₹500 Advance</span>
                    </div>
                    <div onClick={() => setPayAtCar(true)}
                      className="p-4 rounded-xl border cursor-pointer text-center"
                      style={payAtCar ? { borderColor: '#B67C3D', background: 'rgba(182,124,61,0.12)' } : { borderColor: 'rgba(182,124,61,0.15)', background: 'rgba(255,255,255,0.3)' }}>
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center`}
                        style={payAtCar ? { borderColor: '#B67C3D', background: '#B67C3D' } : { borderColor: '#6b5e50' }}>
                        {payAtCar && <div className="w-2 h-2 rounded-full" style={{ background: '#19130E' }} />}
                      </div>
                      <span className="text-[11px] font-black block" style={{ color: '#19130E' }}>Pay at Car</span>
                      <span className="text-[9px] font-bold block mt-1" style={{ color: '#6b5e50' }}>Full amount</span>
                    </div>
                  </div>
                </div>

                {!payAtCar ? (
                  <div className="mt-6 p-5 rounded-2xl flex justify-between items-center" style={{ background: 'rgba(182,124,61,0.12)', border: '1px solid rgba(182,124,61,0.25)' }}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5" style={{ color: '#B67C3D' }}>Booking Advance</span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: '#6b5e50' }}>Non-Refundable Fee</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-display font-bold" style={{ color: '#B67C3D' }}>₹500</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-5 rounded-2xl flex justify-between items-center" style={{ background: 'rgba(25,19,14,0.06)', border: '1px solid rgba(182,124,61,0.15)' }}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5" style={{ color: '#19130E' }}>Full Amount</span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: '#6b5e50' }}>Payable at pickup</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-display font-bold" style={{ color: '#19130E' }}>₹{Math.max(0, total - discount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          </div>

          {/* Terms Box */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">Rental Terms & Conditions</label>
            <div className="h-56 overflow-y-auto bg-off rounded-xl border border-border p-5 text-[11px] text-muted font-bold leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div>
                <strong className="text-dark uppercase tracking-tighter">1. Advance Payment</strong><br />
                A non-refundable advance is required to confirm your booking. This amount will be adjusted against your total rental charge at the time of vehicle pickup.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">2. Non-Refundable Policy</strong><br />
                The advance payment is strictly non-refundable under any circumstances, including cancellation by the customer, change of plans, or no-show.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">3. Cancellation</strong><br />
                Cancellations must be made at least 24 hours before the scheduled pickup time. Late cancellations will forfeit the advance with no credit or rescheduling offered.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">4. Vehicle Pickup</strong><br />
                The customer must present a valid government-issued photo ID and a valid driving licence at the time of pickup. Failure to produce these documents will result in cancellation of the booking with no refund of the advance.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">5. Fuel Policy</strong><br />
                All vehicles are provided with a full tank and must be returned with a full tank. Any fuel shortfall will be charged at actuals plus a service fee.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">6. Damage Policy</strong><br />
                The customer is fully responsible for any damage to the vehicle during the rental period, including accidental, intentional, or negligence-related damage. Repair costs will be recovered from the customer.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">7. Traffic Violations</strong><br />
                Any traffic fines, challans, or legal violations incurred during the rental period are the sole responsibility of the customer.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">8. Return Time</strong><br />
                The vehicle must be returned by the agreed drop-off time. Late returns will be charged at the hourly rate applicable to the vehicle category.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">9. Prohibited Use</strong><br />
                The rented vehicle must not be used for illegal activities, sub-renting, racing, off-roading (unless explicitly permitted), or travel outside the permitted area agreed at the time of booking.
              </div>
              <div>
                <strong className="text-dark uppercase tracking-tighter">10. Contact & Support</strong><br />
                For any assistance during the rental period, contact Modern Drive directly on the number provided at the time of booking confirmation.
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)' }}>
            <div className="relative flex items-center">
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="sr-only" />
              <div className="w-6 h-6 rounded-lg border-2 flex items-center justify-center"
                style={agreedTerms ? { background: '#19130E', borderColor: '#19130E' } : { borderColor: '#6b5e50' }}>
                {agreedTerms && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-dark font-black uppercase tracking-widest mb-0.5">I Accept the Rental Policy</p>
              <p className="text-[9px] text-muted font-bold">I confirm that all details provided are correct and I agree to the terms.</p>
            </div>
          </label>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button onClick={() => setStep(2)}
              className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest"
              style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }}>
              Back
            </button>
            <button onClick={handleFinalBooking} disabled={isBooking || !agreedTerms}
              className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
              style={{ background: '#B67C3D', color: '#19130E' }}>
              <LockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dark/40" />
              <span>{isBooking ? 'Processing...' : payAtCar ? `Confirm — ₹${Math.max(0, total).toLocaleString('en-IN')}` : 'Pay ₹500'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success State */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-1000">
          <div className="relative mb-12">
            <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin duration-[3000ms]" />
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#B67C3D' }}>
                <CheckIcon className="w-14 h-14" style={{ color: '#19130E' }} />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: '#19130E', color: '#B67C3D', border: '2px solid #B67C3D' }}>
              Success
            </div>
          </div>
          
          <div className="text-center space-y-4 mb-12">
            <h4 className="text-4xl font-display font-bold text-dark tracking-tight leading-none">Booking Confirmed!</h4>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Reference Number</span>
              <div className="px-8 py-3 text-2xl font-display font-bold rounded-2xl tracking-widest" style={{ background: '#19130E', color: '#B67C3D', border: '1px solid rgba(255,255,255,0.1)' }}>
                {bookingRef}
              </div>
            </div>
            <div className="pt-4 space-y-1">
              <p className="text-sm font-bold text-dark">{car.make} {car.model}</p>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                {new Date(bookingData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {bookingData.pickupTime} to {new Date(bookingData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="bg-off p-6 rounded-3xl border border-border max-w-sm w-full mb-12 text-center">
            <p className="text-sm text-dark font-bold mb-1">We've received your request!</p>
            <p className="text-[11px] text-muted font-bold leading-relaxed">
              Redirecting you to the <span className="text-dark">Confirmation Dashboard</span> where you can track your status and manage documents.
            </p>
          </div>

          <div className="w-64 h-2 bg-off rounded-full overflow-hidden relative border border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-dark to-accent animate-[progress_1.5s_ease-in-out_infinite] blur-[1px]" style={{ width: '60%' }} />
          </div>
          
          <style>{`
            @keyframes progress {
              0% { transform: translateX(-150%); }
              100% { transform: translateX(150%); }
            }
          `}</style>
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[7px] sm:text-[8px] font-black text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em]">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[7px] sm:text-[8px] font-black text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em]">Secure Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
