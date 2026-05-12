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
  const [step, setStep] = useState(1); // 1: Dates, 2: Verification
  const [bookingData, setBookingData] = useState({ 
    startDate: '', 
    endDate: '', 
    notes: '', 
    promoCode: '' 
  });

  const [verificationData, setVerificationData] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    licenseFront: null,
    licenseBack: null,
    signature: null
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discount, setDiscount] = useState(0);

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

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('documents', file);
    const res = await uploadAPI.documents(formData);
    return res.data.data.files[0];
  };

  const handleProceed = () => {
    if (!customer) {
      toast.error('Please sign in to book a car');
      navigate('/signin');
      return;
    }
    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select dates');
      return;
    }
    setStep(2);
  };

  const handleFinalBooking = async () => {
    const { aadhaarFront, aadhaarBack, licenseFront, licenseBack, signature } = verificationData;
    if (!aadhaarFront || !aadhaarBack || !licenseFront || !licenseBack || !signature) {
      toast.error('Please upload all documents and sign');
      return;
    }

    setIsBooking(true);
    try {
      // 1. Upload documents to Cloudinary
      const uploads = await Promise.all([
        uploadFile(aadhaarFront),
        uploadFile(aadhaarBack),
        uploadFile(licenseFront),
        uploadFile(licenseBack),
        // Signature is base64, we need to convert it or handle it separately
        fetch(signature).then(res => res.blob()).then(blob => {
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          return uploadFile(file);
        })
      ]);

      const [af, ab, lf, lb, sig] = uploads;

      // 2. Create Booking
      const res = await bookingAPI.create({
        carId: car._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        notes: bookingData.notes,
        promoCode: bookingData.promoCode || undefined,
        documents: {
          aadhaar: { front: af, back: ab },
          license: { front: lf, back: lb }
        },
        signature: sig
      });

      const { booking, razorpayOrderId, amount } = res.data.data;
      toast.success('Documents verified! Proceeding to payment...');
      navigate(`/booking-confirmation/${booking._id}`, {
        state: { booking, razorpayOrderId, amount, customer }
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to complete verification');
    } finally {
      setIsBooking(false);
    }
  };

  const total = calculateTotal() - discount;
  const days = bookingData.startDate && bookingData.endDate
    ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) || 1
    : 1;

  const today = new Date().toISOString().split('T')[0];

  const DocumentField = ({ label, id, value, onChange }) => (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">{label}</label>
      <div className={`relative h-24 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer
        ${value ? 'border-accent bg-accent/5' : 'border-border bg-off hover:border-dark-alt hover:bg-gray-50'}`}>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={e => onChange(e.target.files[0])} />
        {value ? (
          <>
            <CheckIcon className="w-6 h-6 text-accent mb-1" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider truncate max-w-full px-2">File Selected</span>
          </>
        ) : (
          <>
            <CameraIcon className="w-6 h-6 text-muted group-hover:text-dark transition-colors mb-1" />
            <span className="text-[9px] font-black text-muted group-hover:text-dark uppercase tracking-widest">Tap to Upload</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-border p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-display font-bold text-dark">
            {step === 1 ? 'Book This Vehicle' : 'Document Verification'}
          </h3>
          <div className="flex gap-1.5">
            <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step === 1 ? 'bg-dark w-10' : 'bg-border'}`} />
            <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step === 2 ? 'bg-dark w-10' : 'bg-border'}`} />
          </div>
        </div>
        
        {step === 1 ? (
          <>
            <div className="space-y-6 mb-8">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted mb-2 block">Start Date</label>
                  <input type="date" min={today}
                    value={bookingData.startDate}
                    onChange={e => setBookingData({ ...bookingData, startDate: e.target.value })}
                    className="w-full bg-off border border-border rounded-lg px-4 py-3 text-sm font-bold text-dark focus:border-dark outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted mb-2 block">End Date</label>
                  <input type="date" min={bookingData.startDate || today}
                    value={bookingData.endDate}
                    onChange={e => setBookingData({ ...bookingData, endDate: e.target.value })}
                    className="w-full bg-off border border-border rounded-lg px-4 py-3 text-sm font-bold text-dark focus:border-dark outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted mb-2 block">Promo Code</label>
                  <div className="relative group">
                    <input type="text"
                      value={bookingData.promoCode}
                      onChange={e => { setBookingData({ ...bookingData, promoCode: e.target.value }); setDiscount(0); }}
                      placeholder="MODERN20"
                      className="w-full bg-off border border-border rounded-lg pl-4 pr-20 py-3 text-sm font-bold text-dark focus:border-dark outline-none transition-colors placeholder:text-muted/40 uppercase" />
                    <button onClick={handlePromoCheck}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-dark text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-black transition-colors whitespace-nowrap z-20">
                      Apply
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted mb-2 block">Special Requests</label>
                  <textarea value={bookingData.notes}
                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="w-full bg-off border border-border rounded-lg px-4 py-3 text-sm font-bold text-dark focus:border-dark outline-none transition-colors resize-none"
                    rows="2" placeholder="Tell us anything special..." />
                </div>
              </div>
            </div>

            <button onClick={handleProceed} disabled={!agreedToTerms}
              className="w-full btn-primary !py-4 flex items-center justify-center gap-3 group shadow-lg shadow-dark/10 disabled:opacity-30 disabled:grayscale transition-all">
              <span className="text-base font-black uppercase tracking-widest">Verify &amp; Proceed</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">Digital Signature</label>
              <SignaturePad 
                onSave={sig => setVerificationData({ ...verificationData, signature: sig })}
                onClear={() => setVerificationData({ ...verificationData, signature: null })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-off border border-border py-4 rounded-xl text-dark font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
                Back
              </button>
              <button onClick={handleFinalBooking} disabled={isBooking || !agreedToTerms}
                className="flex-[2] btn-primary !py-4 flex items-center justify-center gap-3 group shadow-lg shadow-dark/10 disabled:opacity-30 disabled:grayscale transition-all">
                <LockIcon className="w-5 h-5" />
                <span className="text-base font-black uppercase tracking-widest">{isBooking ? 'Finalizing...' : 'Confirm & Pay'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-between items-center text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-4">
            <span>Summary ({days} Day{days > 1 ? 's' : ''})</span>
            <span className="text-dark">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <label className="flex items-start gap-4 p-4 bg-off rounded-xl border border-border cursor-pointer hover:bg-white transition-colors group">
            <div className="relative flex items-center">
              <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="sr-only" />
              <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${agreedToTerms ? 'bg-dark border-dark' : 'border-muted group-hover:border-dark'}`}>
                {agreedToTerms && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] text-dark font-black uppercase tracking-widest leading-none">Agreement</p>
              <p className="text-[9px] text-muted font-bold leading-tight">
                By proceeding, you agree to the rental terms. Documents are processed securely and encrypted.
              </p>
            </div>
            <ShieldIcon className={`w-4 h-4 transition-colors ${agreedToTerms ? 'text-accent' : 'text-muted'}`} />
          </label>
        </div>
      </div>
    </div>
  );
}
