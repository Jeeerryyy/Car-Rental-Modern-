import React, { useState, useEffect } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useNavigate, Link } from 'react-router-dom';
import { LockIcon, ArrowRightIcon, ShieldIcon, CameraIcon, CheckIcon } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, promoAPI, uploadAPI, carAPI } from '../../services/api';
import toast from 'react-hot-toast';
import SignaturePad from '../ui/SignaturePad';
import { getSocket } from '../../lib/socket.js';
import { SOCKET_EVENTS } from '../../lib/socket.events.js';

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
    pickupLocation: 'Junagadh Office'
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

  // Availability State
  const [availability, setAvailability] = useState({
    isBooked: car.isBooked || false,
    bookedUntil: car.bookedUntil || null,
    nextAvailableDate: car.nextAvailableDate || null,
    bookedRanges: car.bookedRanges || []
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const fetchAvailability = async () => {
    if (!car?._id) return;
    try {
      setLoadingAvailability(true);
      const res = await carAPI.getAvailability(car._id);
      if (res.data?.data) {
        setAvailability(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [car?._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleAvailabilityUpdate = (data) => {
      if (!data?.carId || data.carId === car._id) {
        fetchAvailability();
      }
    };
    socket.on(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, handleAvailabilityUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, handleAvailabilityUpdate);
    };
  }, [car?._id]);

  // Auto-fill dates if currently booked
  useEffect(() => {
    if (availability?.isBooked && availability?.nextAvailableDate) {
      const nextDateStr = new Date(availability.nextAvailableDate).toISOString().split('T')[0];
      setBookingData(prev => {
        if (!prev.startDate || prev.startDate < nextDateStr) {
          const nextDay = new Date(new Date(nextDateStr).getTime() + 86400000).toISOString().split('T')[0];
          return {
            ...prev,
            startDate: nextDateStr,
            endDate: prev.endDate && prev.endDate > nextDateStr ? prev.endDate : nextDay
          };
        }
        return prev;
      });
    }
  }, [availability?.isBooked, availability?.nextAvailableDate]);

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

  // Reset window scroll to top when booking step transitions to prevent browser layout scrolling to bottom
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const calculateTotal = () => {
    const p = Number(car?.pricePerDay || 0);
    if (!bookingData.startDate || !bookingData.endDate) return p;
    const start = new Date(`${bookingData.startDate}T${bookingData.pickupTime}`);
    const end = new Date(`${bookingData.endDate}T${bookingData.returnTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return p;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return p;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
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

  const todayStr = new Date().toISOString().split('T')[0];

  const applyDayPreset = (days) => {
    const baseDateStr = bookingData.startDate || (availability.isBooked && availability.nextAvailableDate ? new Date(availability.nextAvailableDate).toISOString().split('T')[0] : todayStr);
    const start = new Date(baseDateStr);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    
    setBookingData({
      ...bookingData,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const checkConflict = (startDate, endDate) => {
    if (!startDate || !endDate || !availability?.bookedRanges || availability.bookedRanges.length === 0) {
      return null;
    }
    const reqStart = new Date(`${startDate}T00:00:00.000Z`).getTime();
    const reqEnd = new Date(`${endDate}T23:59:59.999Z`).getTime();

    for (const range of availability.bookedRanges) {
      const rStart = new Date(range.startDate).getTime();
      const rEnd = new Date(range.endDate).getTime();
      if (Math.max(reqStart, rStart) <= Math.min(reqEnd, rEnd)) {
        return range;
      }
    }
    return null;
  };

  const dateConflict = checkConflict(bookingData.startDate, bookingData.endDate);

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
      const startDateTime = new Date(`${bookingData.startDate}T${bookingData.pickupTime}`);
      const endDateTime = new Date(`${bookingData.endDate}T${bookingData.returnTime}`);
      if (endDateTime <= startDateTime) {
        toast.error('Return date & time must be later than pickup date & time');
        return;
      }
      if (dateConflict) {
        toast.error('Selected dates overlap with an existing booking. Please pick another date range.');
        return;
      }
      if (!bookingData.phone || bookingData.phone.trim() === '') {
        toast.error('Phone number is compulsory to proceed');
        return;
      }
      if (!isValidPhoneNumber(bookingData.phone, 'IN')) {
        toast.error('Please enter a valid Indian mobile number');
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
        startDate: `${bookingData.startDate}T${bookingData.pickupTime}`,
        endDate: `${bookingData.endDate}T${bookingData.returnTime}`,
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

      const res = await bookingAPI.create(bookingPayload);
      const bookingDataRes = res.data.data.booking;
      const { razorpayOrderId, amount, keyId } = res.data.data;

      // Dynamically load Razorpay script if needed
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load payment gateway.'));
          document.body.appendChild(script);
        });
      }

      // Check if it's mock/test mode
      const isMock = !razorpayOrderId || razorpayOrderId.startsWith('mock_order_') || !keyId || keyId === 'your-razorpay-key-id';

      if (isMock) {
        const toastId = toast.loading('Simulating secure sandbox payment...');
        setTimeout(async () => {
          try {
            const verifyRes = await bookingAPI.verifyPayment({
              bookingId: bookingDataRes._id,
              razorpayOrderId: razorpayOrderId || `mock_order_${Date.now()}`,
              razorpayPaymentId: `mock_pay_${Date.now()}`,
              razorpaySignature: 'mock_sig'
            });
            toast.success('Sandbox Payment Verified!', { id: toastId });
            const confirmedBooking = verifyRes.data.data.booking || verifyRes.data.data;
            setBookingRef(confirmedBooking.referenceId || confirmedBooking._id?.slice(-6).toUpperCase() || 'CONFIRMED');
            setStep(4);
            setTimeout(() => {
              navigate(`/booking-confirmation/${confirmedBooking._id}`, {
                state: { booking: confirmedBooking, customer }
              });
            }, 2000);
          } catch (verifyErr) {
            console.error('Mock verification failed:', verifyErr);
            toast.error('Sandbox verification failed', { id: toastId });
          } finally {
            setIsBooking(false);
          }
        }, 1500);
        return;
      }

      // Real Razorpay integration
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Modern Selfdrive',
        description: `${car.make} ${car.model} — Advance Booking Payment`,
        order_id: razorpayOrderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: bookingPayload.phone || '',
        },
        theme: {
          color: '#A56A43',
        },
        handler: async (response) => {
          const toastId = toast.loading('Verifying payment signature...');
          try {
            const verifyRes = await bookingAPI.verifyPayment({
              bookingId: bookingDataRes._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment Verified! Booking Confirmed.', { id: toastId });
            const confirmedBooking = verifyRes.data.data.booking || verifyRes.data.data;
            setBookingRef(confirmedBooking.referenceId || confirmedBooking._id?.slice(-6).toUpperCase() || 'CONFIRMED');
            setStep(4);
            setTimeout(() => {
              navigate(`/booking-confirmation/${confirmedBooking._id}`, {
                state: { booking: confirmedBooking, customer }
              });
            }, 2000);
          } catch (verifyErr) {
            console.error('Verification failed:', verifyErr);
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed', { id: toastId });
          } finally {
            setIsBooking(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment was cancelled. Your booking remains pending.');
            setIsBooking(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    } catch (err) {
      console.error('Booking Error:', err);
      toast.error(err.response?.data?.message || 'Failed to process booking');
    } finally {
      setIsBooking(false);
    }
  };

  const total = calculateTotal() - discount;
  const days = bookingData.startDate && bookingData.endDate
    ? Math.ceil((new Date(`${bookingData.endDate}T${bookingData.returnTime}`) - new Date(`${bookingData.startDate}T${bookingData.pickupTime}`)) / (1000 * 60 * 60 * 24)) || 1
    : 1;

  const today = new Date().toISOString().split('T')[0];

  const DocumentField = ({ label, value, onChange }) => (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: '#5C5C5C' }}>{label}</label>
      <div className="relative h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer"
        style={{ borderColor: value ? '#A56A43' : 'rgba(182,124,61,0.2)', background: value ? 'rgba(182,124,61,0.05)' : '#E7E0D4' }}>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={e => onChange(e.target.files[0])} />
        {value ? (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: '#A56A43' }}>
              <CheckIcon className="w-5 h-5" style={{ color: '#F4F1EA' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-full px-2" style={{ color: '#121212' }}>Uploaded</span>
          </>
        ) : (
          <>
            <CameraIcon className="w-6 h-6 mb-1" style={{ color: '#5C5C5C' }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#5C5C5C' }}>Tap to Upload</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
      {/* Progress Tracker */}
      <div className="mb-6 sm:mb-10 px-2 sm:px-4">
        <div className="flex w-full relative items-center">
          {/* Connecting Line Background */}
          <div className="absolute top-4 left-[12.5%] right-[12.5%] h-[2px]" style={{ background: '#D6D0C7' }} />
          
          {[
            { n: 1, label: 'Dates' },
            { n: 2, label: 'Verify' },
            { n: 3, label: 'Pay' },
            { n: 4, label: 'Done' }
          ].map(({ n, label }, i) => (
            <div key={n} className="flex-1 flex flex-col items-center relative z-10">
              <div className="relative flex items-center justify-center w-full">
                {/* Active/Completed Line */}
                {i > 0 && (
                  <div className="absolute right-[50%] top-1/2 -translate-y-1/2 h-[2px] w-full"
                    style={{ background: step >= n ? '#A56A43' : 'transparent', display: step > i ? 'block' : 'none' }} />
                )}
                
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black relative z-20 transition-all duration-500"
                  style={step === n ? { background: '#A56A43', borderColor: '#A56A43', color: '#121212', transform: 'scale(1.1)' } :
                    step > n ? { background: '#A56A43', borderColor: '#A56A43', color: '#121212' } : { background: '#E7E0D4', borderColor: '#D6D0C7', color: '#5C5C5C' }}>
                  {step > n ? <CheckIcon className="w-4 h-4 text-[#121212]" /> : n}
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider mt-2 transition-colors duration-500"
                style={{ color: step >= n ? '#121212' : '#5C5C5C' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px -mx-4 sm:-mx-6 lg:-mx-8 mb-6 sm:mb-8" style={{ background: 'rgba(182,124,61,0.1)' }} />

      {/* Step 1: Dates & Times */}
      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#121212' }}>Select Rental Schedule</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6" style={{ color: '#5C5C5C' }}>Choose your preferred dates and pickup point</p>
          </div>

          {/* Currently Booked Notice */}
          {availability.isBooked && (
            <div className="p-4 rounded-xl border border-amber-600/30 bg-amber-500/10 shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping inline-block" />
                <span>Vehicle Currently Reserved</span>
              </div>
              <p className="text-xs text-[#121212] leading-relaxed">
                This vehicle is currently on a trip and will be ready for pickup from{' '}
                <strong className="text-amber-950 font-black underline decoration-amber-600">
                  {availability.nextAvailableDate
                    ? new Date(availability.nextAvailableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                    : (availability.bookedUntil ? new Date(availability.bookedUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Soon')}
                </strong>.
                We have automatically prefilled the next available rental dates below.
              </p>
            </div>
          )}

          {/* Reserved Schedule Badges if any upcoming reservations exist */}
          {availability.bookedRanges && availability.bookedRanges.length > 0 && (
            <div className="p-3.5 rounded-xl border border-[#D6D0C7] bg-[#F4F1EA]">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#5C5C5C] mb-2">
                <span>Unavailable / Booked Periods</span>
                <span className="text-[9px] lowercase font-semibold text-amber-800">auto-detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availability.bookedRanges.map((range, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-amber-100/80 text-amber-900 border border-amber-300">
                    <span className="text-amber-700">🚫</span>
                    {new Date(range.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(range.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#5C5C5C' }}>Quick Select Duration</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3].map(d => (
                <button key={d} onClick={() => applyDayPreset(d)}
                  className="flex flex-col items-center justify-center py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all"
                  style={days === d ? { border: '1px solid #A56A43', background: 'rgba(182,124,61,0.05)' } : { border: '1px solid #D6D0C7', background: '#E7E0D4' }}>
                  <span className="text-xl sm:text-2xl font-display font-bold" style={{ color: days === d ? '#A56A43' : '#121212' }}>{d}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest" style={{ color: days === d ? '#A56A43' : '#5C5C5C' }}>Day{d > 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#5C5C5C' }}>Pickup Date</label>
              <input type="date" min={todayStr} value={bookingData.startDate}
                onChange={e => setBookingData({ ...bookingData, startDate: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#121212' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#5C5C5C' }}>Pickup Time</label>
              <input type="time" value={bookingData.pickupTime}
                onChange={e => setBookingData({ ...bookingData, pickupTime: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#121212' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#5C5C5C' }}>Return Date</label>
              <input type="date" min={bookingData.startDate || todayStr} value={bookingData.endDate}
                onChange={e => setBookingData({ ...bookingData, endDate: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#121212' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#5C5C5C' }}>Return Time</label>
              <input type="time" value={bookingData.returnTime}
                onChange={e => setBookingData({ ...bookingData, returnTime: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#121212' }} />
            </div>
          </div>

          {/* Date Overlap Conflict Alert */}
          {dateConflict && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-900 shadow-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div className="text-xs">
                <p className="font-black uppercase tracking-wider text-red-700">Dates Not Available</p>
                <p className="mt-1 font-medium leading-relaxed text-red-900">
                  This car is already booked from{' '}
                  <strong>{new Date(dateConflict.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> to{' '}
                  <strong>{new Date(dateConflict.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                  Please adjust your dates to proceed.
                </p>
              </div>
            </div>
          )}

          {/* Pickup Location */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#5C5C5C' }}>Pickup Location</label>
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2" style={{ borderColor: '#A56A43', background: 'rgba(182,124,61,0.05)' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent" style={{ color: '#A56A43' }}>Primary Office</span>
                  <h4 className="text-sm font-bold text-dark">Junagadh Office</h4>
                  <p className="text-xs leading-relaxed text-muted" style={{ color: '#5C5C5C' }}>
                    GIDC-1 , NEAR MAHAVEER MARBLE, DOLATPARA,JUNAGADH 362037
                  </p>
                  <a href="https://g.page/modern-selfdrive" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mt-2 hover:underline" style={{ color: '#A56A43' }}>
                    <span>📍 View on Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm" style={{ background: 'rgba(165,106,67,0.05)', border: '2px solid #A56A43' }}>
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 block" style={{ color: '#A56A43' }}>Contact Phone Number *</label>
            <input type="tel" value={bookingData.phone} maxLength={10}
              placeholder="Enter 10-digit mobile number"
              onChange={e => setBookingData({ ...bookingData, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#A56A43]/30 transition-all" style={{ background: '#FFFFFF', border: '1px solid #D6D0C7', color: '#121212' }} />
            <p className="text-[9px] font-bold text-muted ml-1" style={{ color: '#5C5C5C' }}>We need this to contact you regarding your booking</p>
          </div>

          {/* Live Summary */}
          {bookingData.startDate && bookingData.endDate && (
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.2)' }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#5C5C5C' }}>
                  <span>Daily Rate</span>
                  <span style={{ color: '#121212' }}>₹{Number(car?.pricePerDay || 0).toLocaleString('en-IN')} / Day</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#5C5C5C' }}>
                  <span>Duration</span>
                  <span style={{ color: '#A56A43' }}>{days} Day{days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#5C5C5C' }}>
                  <span>Location</span>
                  <span className="truncate max-w-[150px]" style={{ color: '#121212' }}>{bookingData.pickupLocation}</span>
                </div>
                <div className="h-px my-1" style={{ background: '#D6D0C7' }} />
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#121212' }}>Total Rental</span>
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#5C5C5C' }}>Balance at pickup: ₹{(total - 500).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-display font-bold" style={{ color: '#121212' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid #D6D0C7' }}>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#A56A43' }}>Due Now (Advance)</span>
                  <span className="text-lg font-display font-bold" style={{ color: '#A56A43' }}>₹500</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleProceed}
            disabled={!!dateConflict}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 transition-all ${
              dateConflict ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.99]'
            }`}
            style={dateConflict ? { background: '#D6D0C7', color: '#5C5C5C', border: '1px solid #D6D0C7' } : { background: '#A56A43', color: '#121212', border: '1px solid #A56A43' }}>
            <span>{dateConflict ? 'Selected Dates Unavailable' : 'Continue to Verification'}</span>
            {!dateConflict && <ArrowRightIcon className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#121212' }}>Identity Verification</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#5C5C5C' }}>Upload clear photos of your documents</p>
            
            <div className="p-4 rounded-xl mb-6 flex gap-3 items-start" style={{ background: 'rgba(182,124,61,0.1)', border: '1px solid rgba(182,124,61,0.2)' }}>
              <ShieldIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#A56A43' }} />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#121212' }}>Document Policy</p>
                <p className="text-[10px] sm:text-[11px] font-bold leading-relaxed" style={{ color: '#5C5C5C' }}>
                  All documents must be <span className="text-[#121212]">original and legitimate</span>. We only accept <span className="text-[#121212]">Aadhaar Card and Driving Licence</span>. Any invalid or incorrect uploads will result in the booking not being processed or immediate cancellation.
                </p>
              </div>
            </div>
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
            <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: '#5C5C5C' }}>Digital Signature</label>
            <SignaturePad 
              defaultValue={verificationData.signature}
              onSave={sig => setVerificationData({ ...verificationData, signature: sig })}
              onClear={() => setVerificationData({ ...verificationData, signature: null })}
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button onClick={() => setStep(1)}
              className="px-6 py-3.5 sm:py-4 rounded-xl font-black text-[10px] uppercase tracking-widest"
              style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#5C5C5C' }}>
              Back
            </button>
            <button onClick={handleProceed}
              className="flex-1 py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3"
              style={{ background: '#A56A43', color: '#121212', border: '1px solid #A56A43' }}>
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
            <h3 className="text-lg sm:text-xl font-display font-bold mb-1" style={{ color: '#121212' }}>Review & Finalize</h3>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6" style={{ color: '#5C5C5C' }}>Confirm your booking details and payment</p>
          {/* Summary Card */}
          <div className="rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 overflow-hidden relative" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.2)' }}>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full" style={{ background: '#D6D0C7', color: '#A56A43', border: '1px solid #DDE8DE' }}>
                      Premium Selection
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-display font-bold leading-tight" style={{ color: '#121212' }}>{car.make} {car.model}</h4>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#5C5C5C' }}>{car.category} • {car.fuelType}</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(182,124,61,0.1)', border: '1px solid rgba(182,124,61,0.2)' }}>
                    <ShieldIcon className="w-6 h-6" style={{ color: '#A56A43' }} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: '#A56A43' }}>Secure Booking</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#5C5C5C' }}>Pickup</span>
                  <p className="text-[11px] sm:text-xs font-bold" style={{ color: '#121212' }}>{new Date(bookingData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[9px] sm:text-[10px] truncate" style={{ color: '#5C5C5C' }}>{bookingData.pickupTime} • {bookingData.pickupLocation}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#5C5C5C' }}>Return</span>
                  <p className="text-[11px] sm:text-xs font-bold" style={{ color: '#121212' }}>{new Date(bookingData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[9px] sm:text-[10px]" style={{ color: '#5C5C5C' }}>{bookingData.returnTime}</p>
                </div>
              </div>

              {/* Signature Preview */}
              <div className="mb-6 sm:mb-8 p-4 rounded-2xl flex items-center gap-4" style={{ background: 'rgba(18,18,18,0.05)', border: '1px solid #D6D0C7' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(182,124,61,0.1)', border: '1px solid rgba(182,124,61,0.2)' }}>
                  <svg className="w-6 h-6" style={{ color: '#A56A43' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#5C5C5C' }}>Verified Signature</span>
                  <div className="h-10 w-full bg-white rounded-lg flex items-center justify-center p-1">
                    {verificationData.signature ? (
                      <img src={verificationData.signature} alt="Signature Preview" className="h-full object-contain opacity-80" />
                    ) : (
                      <span className="text-[10px] italic" style={{ color: '#5C5C5C' }}>No signature captured</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6 sm:mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: '#5C5C5C' }}>Promo Code (Optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={bookingData.promoCode} 
                    onChange={e => setBookingData({ ...bookingData, promoCode: e.target.value.toUpperCase() })}
                    placeholder="ENTER CODE"
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none uppercase" 
                    style={{ background: '#FFFFFF', border: '1px solid #D6D0C7', color: '#121212' }} />
                  <button onClick={handlePromoCheck}
                    className="px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-opacity"
                    style={{ background: '#121212', color: '#FFFFFF' }}>
                    Apply
                  </button>
                </div>
              </div>


              <div className="space-y-4 pt-6" style={{ borderTop: '1px solid #D6D0C7' }}>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: '#5C5C5C' }}>
                  <span>Rental Rate (x{days} Days)</span>
                  <span style={{ color: '#121212' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                    <span>Promo Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="mt-6 p-5 rounded-2xl flex justify-between items-center" style={{ background: 'rgba(165,106,67,0.12)', border: '1px solid #DDE8DE' }}>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5" style={{ color: '#A56A43' }}>Booking Advance</span>
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#5C5C5C' }}>Non-Refundable Fee</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-display font-bold" style={{ color: '#A56A43' }}>₹500</span>
                  </div>
                </div>
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
          <label className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
            <div className="relative flex items-center">
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="sr-only" />
              <div className="w-6 h-6 rounded-lg border-2 flex items-center justify-center"
                style={agreedTerms ? { background: '#121212', borderColor: '#121212' } : { borderColor: '#5C5C5C' }}>
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
              className="px-6 py-3.5 sm:py-4 rounded-xl font-black text-[10px] uppercase tracking-widest"
              style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', color: '#5C5C5C' }}>
              Back
            </button>
            <button onClick={handleFinalBooking} disabled={isBooking || !agreedTerms}
              className="flex-1 py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
              style={{ background: '#A56A43', color: '#121212', border: '1px solid #A56A43' }}>
              <LockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dark/40" />
              <span>{isBooking ? 'Processing...' : 'Pay ₹500'}</span>
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
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#A56A43' }}>
                <CheckIcon className="w-14 h-14" style={{ color: '#121212' }} />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: '#121212', color: '#A56A43', border: '2px solid #A56A43' }}>
              Success
            </div>
          </div>
          
          <div className="text-center space-y-4 mb-12">
            <h4 className="text-4xl font-display font-bold text-dark tracking-tight leading-none">Booking Confirmed!</h4>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Reference Number</span>
              <div className="px-8 py-3 text-2xl font-display font-bold rounded-2xl tracking-widest" style={{ background: '#121212', color: '#A56A43', border: '1px solid rgba(255,255,255,0.1)' }}>
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
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6" style={{ borderTop: '1px solid #D6D0C7' }}>
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
