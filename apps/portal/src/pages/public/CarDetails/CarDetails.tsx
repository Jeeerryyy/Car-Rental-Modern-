import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { useCustomerAuth } from '../../../context/CustomerAuthContext.jsx';
import * as customerApi from '../../../api/public/customerApi.js';
import VehicleHero from '../../../components/public/VehicleHero.jsx';
import VehicleSpecs from '../../../components/public/VehicleSpecs.jsx';

const ADVANCE = 500;

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ArrowLeft = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
);

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="font-headline-xl text-secondary" style={{ fontSize: '48px' }}>Loading...</div>
  </div>
);

export default function CarDetails() {
  const { id } = useParams ? { id: window.location.pathname.split('/').pop() } : { id: null };
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Step state: 1=dates, 2=docs, 3=signature, 4=terms/pay, 5=confirmed
  const [step, setStep] = useState(1);

  // Booking dates
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDays, setSelectedDays] = useState(null);

  // Location & contact
  const [pickupLocation, setPickupLocation] = useState('Junagadh Office');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [phoneError, setPhoneError] = useState('');

  // Documents
  const [aadhar, setAadhar] = useState(null);
  const [license, setLicense] = useState(null);

  // Signature
  const signaturePadRef = useRef(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const [sigWidth, setSigWidth] = useState(300);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [capturedSignatureUrl, setCapturedSignatureUrl] = useState(null);

  // Update signature width on mount and resize
  useEffect(() => {
    if (step === 3) {
      const updateWidth = () => {
        if (signatureContainerRef.current) {
          setSigWidth(signatureContainerRef.current.offsetWidth);
        }
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [step]);

  // Payment
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [payError, setPayError] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);
  const [payAtCar, setPayAtCar] = useState(false);

  // Promo
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Image gallery
  const [imgIdx, setImgIdx] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const heroImages = car?.images?.length > 0
    ? car.images.map(img => typeof img === 'string' ? img : img.url)
    : ['https://placehold.co/800x400/111/fff?text=No+Image'];

  useEffect(() => {
    if (!id) return;
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = (await customerApi.getCarById(id)).data;
        const raw = response?.data;
        setCar(raw?.car || raw || response);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
      window.scrollTo(0, 0);
    };
    fetchCar();
  }, [id]);

  // Sync days ↔ dates
  useEffect(() => {
    if (!car) return;
    if (pickupDate && returnDate) {
      const dMs = (new Date(returnDate).getTime() - new Date(pickupDate).getTime());
      const total = dMs > 0 ? Math.max(0, Math.ceil(dMs / 86400000)) : 0;
      setTotalDays(total);
      setTotalPrice(total * (car.pricePerDay || 0));
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [pickupDate, returnDate, car]);

  const applyDayPreset = (days) => {
    setSelectedDays(days);
    const start = pickupDate || today;
    setPickupDate(start);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setReturnDate(end.toISOString().split('T')[0]);
  };

  const validatePhone = (val) => /^[6-9]\d{9}$/.test(val);

  const step1Valid = pickupDate && pickupTime && returnDate && returnTime && totalDays > 0
    && validatePhone(phone)
    && (!car?.location || pickupLocation ? true : true);

  const CAR_DAY_PRESETS = [1, 2, 3];

  const handlePay = async () => {
    setPayProcessing(true);
    setPayError(null);
    try {
      const [aadharB64, licenseB64] = await Promise.all([
        toBase64(aadhar),
        toBase64(license),
      ]);

      const uploadData = (await customerApi.uploadDocuments({ aadhar: aadharB64, license: licenseB64 })).data;
      const signatureDataUrl = capturedSignatureUrl || (signaturePadRef.current?.isEmpty() ? null : signaturePadRef.current?.toDataURL()) || null;
      
      let signatureCloudinary = {};
      if (signatureDataUrl) {
        try {
          const sigRes = (await customerApi.uploadSignature({ signature: signatureDataUrl })).data;
          signatureCloudinary = sigRes.data?.files?.signature || sigRes.files?.signature || {};
        } catch (sigErr) {
          console.error("Signature upload failed, falling back to local URL", sigErr);
          signatureCloudinary = { url: signatureDataUrl };
        }
      }

      const finalPrice = Math.max(0, totalPrice - (appliedPromo?.discountAmount || 0));

      if (payAtCar) {
        const orderData = (await customerApi.createCashBooking({
          customerInfo: {
            name: customer?.name || 'Customer',
            email: customer?.email || '',
            phone: phone.trim(),
          },
          carId: car._id,
          pickupLocation: pickupLocation || car.location,
          startDate: pickupDate,
          startTime: pickupTime,
          endDate: returnDate,
          endTime: returnTime,
          totalDays,
          totalPrice: finalPrice,
          promoCode: appliedPromo?.code || null,
          discountAmount: appliedPromo?.discountAmount || 0,
          documents: {
            aadhaar: { front: { url: uploadData.files.aadhar.url } },
            license: { front: { url: uploadData.files.license.url } },
          },
          signature: signatureCloudinary,
        })).data;

        setBookingRef(orderData.bookingDetails?.referenceId || `MD${Date.now().toString().slice(-6)}`);
        setStep(5);
        setPayProcessing(false);
        return;
      }

      const orderData = (await customerApi.createOrder({
        customerInfo: {
          name: customer?.name || 'Customer',
          email: customer?.email || '',
          phone: phone.trim(),
        },
        carId: car._id,
        pickupLocation: pickupLocation || car.location,
        startDate: pickupDate,
        startTime: pickupTime,
        endDate: returnDate,
        endTime: returnTime,
        totalDays,
        totalPrice: finalPrice,
        promoCode: appliedPromo?.code || null,
        documents: {
          aadhaar: { front: { url: uploadData.files.aadhar.url } },
          license: { front: { url: uploadData.files.license.url } },
        },
        signature: signatureCloudinary,
      })).data;

      if (orderData.razorpay) {
        if (!(window as any).Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load payment gateway.'));
            document.body.appendChild(script);
          });
        }

        const { orderId, amount, currency, keyId } = orderData.razorpay;
        const rzp = new (window as any).Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'modern self drive',
          description: `${car.make} ${car.model} — Advance Payment`,
          order_id: orderId,
          prefill: {
            name: customer?.name || '',
            email: customer?.email || '',
            contact: phone || '',
          },
          theme: { color: '#C89B5B' },
          handler: async (response) => {
            try {
              const verifyData = (await customerApi.verifyPayment({
                bookingId: orderData.bookingDetails?._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })).data;
              setBookingRef(verifyData.booking?.referenceId || orderData.bookingDetails?.referenceId || `MD${Date.now().toString().slice(-6)}`);
              setStep(5);
            } catch (verifyErr) {
              setPayError(verifyErr.message || 'Payment verification failed.');
            }
            setPayProcessing(false);
          },
          modal: {
            ondismiss: () => {
              setPayError('Payment was cancelled. Your booking is still pending.');
              setPayProcessing(false);
            },
          },
        });
        rzp.open();
        return;
      }

      setBookingRef(orderData.bookingDetails?.referenceId || `MD${Date.now().toString().slice(-6)}`);
      setStep(5);
      setPayProcessing(false);
    } catch (err) {
      setPayError(err.message);
      setPayProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!car) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="font-headline-xl text-on-surface mb-3" style={{ fontSize: '60px' }}>
          {fetchError ? 'Error' : 'Not Found'}
        </div>
        {fetchError && <p className="text-red-600 text-sm mb-4">{fetchError}</p>}
        <Link to="/" className="text-secondary font-bold text-sm">← Back to Fleet</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-surface min-h-screen pt-16">
      {/* Hero */}
      <VehicleHero car={car} heroImages={heroImages} />

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* Left: specs */}
        <div>
          <VehicleSpecs car={car} />
        </div>

        {/* Right: booking card */}
        <div>
          {!customer ? (
            <div className="bg-white rounded-[20px] border border-outline-variant p-6 text-center shadow-md sticky top-24">
              <div className="text-4xl mb-3">🔒</div>
              <div className="font-headline-xl text-on-surface mb-2" style={{ fontSize: '26px', letterSpacing: '0.02em' }}>
                Login to Book
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Create a free account to book this {car.type}.
              </p>
              <Link to="/login" state={{ from: `/cars/${id}` }}
                className="block w-full py-3.5 bg-secondary text-[#111] font-bold text-xs uppercase tracking-widest text-center rounded-xl hover:bg-[#B08040] transition-colors">
                Login / Sign Up
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] border border-outline-variant p-6 sticky top-24 shadow-md">
              {step < 5 && (
                <div className="flex items-center mb-5">
                  {[
                    { n: 1, label: 'Dates' },
                    { n: 2, label: 'Docs' },
                    { n: 3, label: 'Sign' },
                    { n: 4, label: 'Pay' },
                  ].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center flex-1">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-extrabold transition-all ${step === n ? 'bg-secondary border-secondary text-[#111]' : step > n ? 'bg-green-500 border-green-500 text-white text-[10px]' : 'border-outline text-on-surface-variant'}`}>
                        {step > n ? '✓' : n}
                      </div>
                      <span className={`ml-1.5 text-[10px] font-bold tracking-widest uppercase ${step === n ? 'text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
                      {i < 3 && <div className={`flex-1 h-px mx-2 ${step > n ? 'bg-green-500' : 'bg-outline'}`} />}
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px bg-outline mb-5 -mx-6" />

              {/* Step 1: Date Selection */}
              {step === 1 && (
                <>
                  <div className="font-headline-xl text-on-surface mb-4" style={{ fontSize: '26px', letterSpacing: '0.02em' }}>
                    Select Days
                  </div>

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Quick Select</label>
                  <div className="flex gap-2 mb-3">
                    {CAR_DAY_PRESETS.map(d => (
                      <div key={d}
                        className={`flex-1 text-center py-2.5 border cursor-pointer transition-all ${selectedDays === d ? 'border-secondary bg-[rgba(200,155,91,0.08)]' : 'border-outline bg-surface-variant hover:border-secondary/50'}`}
                        onClick={() => applyDayPreset(d)}>
                        <div className="font-headline-xl text-on-surface" style={{ fontSize: '22px' }}>{d}</div>
                        <div className="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant mt-1">Day{d > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 text-center">or custom dates</div>

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Pickup Date</label>
                  <input type="date" min={today} value={pickupDate}
                    onChange={e => { setPickupDate(e.target.value); setSelectedDays(null); if (returnDate && e.target.value >= returnDate) setReturnDate(''); }}
                    className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-base mb-4 outline-none focus:border-secondary/50 box-border" />

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Pickup Time</label>
                  <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                    className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-base mb-4 outline-none focus:border-secondary/50 box-border" />

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Return Date</label>
                  <input type="date" min={pickupDate || today} value={returnDate}
                    onChange={e => { setReturnDate(e.target.value); setSelectedDays(null); }}
                    className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-base mb-4 outline-none focus:border-secondary/50 box-border" />

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Return Time</label>
                  <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)}
                    className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-base mb-4 outline-none focus:border-secondary/50 box-border" />

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Pickup Location</label>
                  <div className="p-4 rounded-xl border border-outline bg-surface-variant mb-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">Primary Office</span>
                      <h4 className="text-sm font-bold text-on-surface">Junagadh Office</h4>
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        GIDC 1, Joshipara, Junagadh - 362002, Gujarat, India
                      </p>
                      <a href="https://g.page/modern-selfdrive" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mt-2 text-secondary hover:underline">
                        <span>📍 View on Google Maps</span>
                      </a>
                    </div>
                  </div>

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Contact Phone Number *</label>
                  <input type="tel" value={phone} maxLength={10} placeholder="10-digit mobile number"
                    onChange={e => { const val = e.target.value.replace(/\D/g, ''); setPhone(val); setPhoneError(val && !validatePhone(val) ? 'Enter a valid 10-digit mobile number.' : ''); }}
                    className={`w-full p-3 bg-surface-variant border text-on-surface font-body text-base mb-1 outline-none focus:border-secondary/50 box-border ${phoneError ? 'border-red-500/50' : 'border-outline'}`} />
                  {phoneError && <p className="text-red-500 text-[11px] mb-2">{phoneError}</p>}
                  <p className="text-on-surface-variant text-[11px] mb-4 leading-relaxed">📞 This number will be used to contact you regarding your booking.</p>

                  {totalDays > 0 && (
                    <div className="bg-surface-variant border border-outline p-3.5 mb-4">
                      <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-2"><span>Rate</span><span>₹{car.pricePerDay?.toLocaleString()} / day</span></div>
                      <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-2"><span>Duration</span><span>{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                      {pickupTime && <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-2"><span>Time</span><span>{pickupTime}</span></div>}
                      {pickupLocation && <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-2"><span>Pickup at</span><span>📍 {pickupLocation}</span></div>}
                      <div className="flex justify-between text-[12px] font-bold text-on-surface mb-2"><span>Total</span><span>₹{totalPrice.toLocaleString()}</span></div>
                      <div className="flex justify-between text-[12px] text-green-600 font-bold"><span>Advance (fixed)</span><span>₹{ADVANCE}</span></div>
                      <div className="flex justify-between text-[12px] text-green-600 font-semibold mt-1"><span>Advance (fixed)</span><span>₹{ADVANCE}</span></div>
                    </div>
                  )}

                  <button
                    className={`w-full py-3.5 text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer transition-colors ${(!car.isActive || !step1Valid) ? 'bg-outline text-on-surface-variant cursor-not-allowed' : 'bg-secondary hover:bg-[#B08040]'}`}
                    disabled={!car.isActive || !step1Valid}
                    onClick={() => setStep(2)}>
                    Continue → Upload Documents
                  </button>
                  {!car.isActive && <p className="text-red-500 text-[11px] mt-2 text-center">This vehicle is currently unavailable</p>}
                </>
              )}

              {/* Step 2: Document Upload */}
              {step === 2 && (
                <>
                  <div className="font-headline-xl text-on-surface mb-1.5" style={{ fontSize: '26px', letterSpacing: '0.02em' }}>
                    Upload Documents
                  </div>
                  <p className="text-on-surface-variant text-[12px] mb-5 leading-relaxed">
                    Your documents are required for verification. Accepted: JPG, PNG, PDF (max 5MB each).
                  </p>

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Aadhar Card</label>
                  <div className={`border-2 border-dashed mb-4 p-6 text-center cursor-pointer relative overflow-hidden transition-all ${aadhar ? 'border-green-500/40 bg-green-50' : 'border-outline bg-surface-variant hover:border-secondary/50 hover:bg-[rgba(200,155,91,0.04)]'}`}>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={e => setAadhar(e.target.files[0])} />
                    <div className={`mb-2 ${aadhar ? 'text-green-500' : 'text-on-surface-variant'}`}>
                      {aadhar ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg> : <UploadIcon />}
                    </div>
                    <div className={`text-[12px] font-bold ${aadhar ? 'text-green-500' : 'text-on-surface-variant'}`}>
                      {aadhar ? aadhar.name : 'Click to upload Aadhar Card'}
                    </div>
                  </div>

                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Driving License</label>
                  <div className={`border-2 border-dashed mb-4 p-6 text-center cursor-pointer relative overflow-hidden transition-all ${license ? 'border-green-500/40 bg-green-50' : 'border-outline bg-surface-variant hover:border-secondary/50 hover:bg-[rgba(200,155,91,0.04)]'}`}>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={e => setLicense(e.target.files[0])} />
                    <div className={`mb-2 ${license ? 'text-green-500' : 'text-on-surface-variant'}`}>
                      {license ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg> : <UploadIcon />}
                    </div>
                    <div className={`text-[12px] font-bold ${license ? 'text-green-500' : 'text-on-surface-variant'}`}>
                      {license ? license.name : 'Click to upload Driving License'}
                    </div>
                  </div>

                  <button className={`w-full py-3.5 text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer transition-colors ${!aadhar || !license ? 'bg-outline text-on-surface-variant cursor-not-allowed' : 'bg-secondary hover:bg-[#B08040]'}`}
                    disabled={!aadhar || !license}
                    onClick={() => setStep(3)}>
                    Continue → Draw Signature
                  </button>
                  <button className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest bg-none border-0 mt-2.5 cursor-pointer flex items-center gap-1.5 hover:text-on-surface transition-colors"
                    onClick={() => setStep(1)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                    Back
                  </button>
                </>
              )}

              {/* Step 3: Signature Pad */}
              {step === 3 && (
                <>
                  <div className="font-headline-xl text-on-surface mb-1.5" style={{ fontSize: '26px', letterSpacing: '0.02em' }}>
                    Draw Your Signature
                  </div>
                  <p className="text-on-surface-variant text-[12px] mb-4 leading-relaxed">
                    Please draw your signature below to confirm the booking agreement.
                  </p>

                  <div ref={signatureContainerRef} className={`border ${signatureEmpty ? 'border-red-500/50' : 'border-outline'} bg-white mb-3 flex justify-center items-center overflow-hidden`}
                    style={{ height: '160px', touchAction: 'none' }}>
                    <SignatureCanvas
                      penColor="#111827"
                      canvasProps={{ width: sigWidth, height: 150, className: 'sigCanvas' }}
                      ref={signaturePadRef}
                      onEnd={() => setSignatureEmpty(false)}
                    />
                  </div>
                  {signatureEmpty && <p className="text-red-500 text-[11px] mb-3">Please draw your signature before continuing.</p>}

                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 py-2 bg-surface-variant border border-outline text-on-surface text-[12px] font-bold cursor-pointer hover:bg-[#E5E7EB] transition-colors rounded-lg"
                      onClick={() => { signaturePadRef.current?.clear(); setSignatureEmpty(true); setCapturedSignatureUrl(null); }}>
                      Clear
                    </button>
                  </div>

                  <button className="w-full py-3.5 bg-secondary text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer hover:bg-[#B08040] transition-colors"
                    onClick={() => {
                      if (signaturePadRef.current?.isEmpty()) { setSignatureEmpty(true); return; }
                      setSignatureEmpty(false);
                      setCapturedSignatureUrl(signaturePadRef.current?.toDataURL());
                      setStep(4);
                    }}>
                    Continue → Review & Pay
                  </button>
                  <button className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest bg-none border-0 mt-2.5 cursor-pointer flex items-center gap-1.5 hover:text-on-surface transition-colors"
                    onClick={() => setStep(2)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                    Back
                  </button>
                </>
              )}

              {/* Step 4: Terms & Payment */}
              {step === 4 && (
                <>
                  <div className="font-headline-xl text-on-surface mb-4" style={{ fontSize: '26px', letterSpacing: '0.02em' }}>
                    Terms & Payment
                  </div>

                  <div className="bg-surface-variant border border-outline p-3.5 mb-4">
                    <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-1.5"><span>{car.make} {car.model}</span><span>{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                    <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-1.5"><span>Pickup</span><span>{pickupDate} {pickupTime ? `at ${pickupTime}` : ''}</span></div>
                    <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-1.5"><span>Return</span><span>{returnDate}</span></div>
                    {pickupLocation && <div className="flex justify-between text-[12px] text-on-surface-variant font-semibold mb-1.5"><span>Location</span><span>📍 {pickupLocation}</span></div>}
                    <div className="flex justify-between text-[12px] font-semibold mb-1.5"><span>Total Rental</span><span>₹{totalPrice.toLocaleString()}</span></div>
                    {appliedPromo && (
                      <>
                        <div className="flex justify-between text-[12px] text-green-600 font-semibold mb-1.5"><span>Promo ({appliedPromo.code})</span><span>-₹{appliedPromo.discountAmount.toLocaleString()}</span></div>
                        <div className="flex justify-between text-[12px] font-bold text-on-surface mb-1.5"><span>Discounted Total</span><span>₹{Math.max(0, totalPrice - (appliedPromo.discountAmount || 0)).toLocaleString()}</span></div>
                      </>
                    )}
                    <div className="flex justify-between text-[15px] font-bold text-secondary pt-2 mt-1 border-t border-outline"><span>{payAtCar ? 'Full Amount' : 'Total'}</span><span>₹{Math.max(0, totalPrice - (appliedPromo?.discountAmount || 0)).toLocaleString()}</span></div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Have a Promo Code?</label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200/50 px-4 py-3 rounded-xl">
                        <div>
                          <span className="text-green-600 font-bold text-[12px]">{appliedPromo.code}</span>
                          <span className="text-green-500 text-[11px] ml-2">−₹{appliedPromo.discountAmount.toLocaleString()} applied</span>
                        </div>
                        <button onClick={() => { setAppliedPromo(null); setPromoInput(''); setPromoError(''); }}
                          className="text-green-400 hover:text-green-600 text-[11px] font-bold flex items-center gap-1">
                          Remove <span className="text-[14px]">×</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                          placeholder="Enter promo code"
                          className="flex-1 p-3 bg-surface-variant border border-outline text-on-surface font-bold text-[13px] uppercase outline-none focus:border-secondary/50 box-border placeholder:text-on-surface-variant placeholder:normal-case" />
                        <button onClick={async () => {
                          if (!promoInput.trim()) return;
                          setPromoLoading(true);
                          setPromoError('');
                          try {
                            const res = (await customerApi.validatePromo(promoInput.trim(), totalPrice)).data;
                            if (res.success) {
                              setAppliedPromo({ code: res.data.code, discountAmount: res.data.discountAmount, discountType: res.data.discountType });
                            }
                          } catch (err) {
                            setPromoError(err.response?.data?.message || 'Invalid promo code');
                          } finally {
                            setPromoLoading(false);
                          }
                        }}
                          disabled={!promoInput.trim() || promoLoading}
                          className="px-5 py-3 bg-primary text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-40 cursor-pointer hover:bg-black/80 transition-colors">
                          {promoLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-red-500 text-[11px] mt-1.5">{promoError}</p>}
                  </div>

                  <label className="block font-headline-lg text-on-surface mb-3" style={{ fontSize: '16px', letterSpacing: '0.02em' }}>Terms & Conditions</label>
                  <div className="max-h-64 overflow-y-auto bg-surface-variant border border-outline p-5 mb-4 text-[12px] text-on-surface-variant leading-relaxed">
                    <div className="mb-4"><strong className="text-on-surface">1. ADVANCE PAYMENT</strong><br />A non-refundable advance is required to confirm your booking.</div>
                    <div className="mb-4"><strong className="text-on-surface">2. NON-REFUNDABLE POLICY</strong><br />The advance payment is strictly non-refundable under any circumstances.</div>
                    <div className="mb-4"><strong className="text-on-surface">3. CANCELLATION</strong><br />Cancellations must be made at least 24 hours before pickup.</div>
                    <div className="mb-4"><strong className="text-on-surface">4. VEHICLE PICKUP</strong><br />Present valid ID and driving licence at pickup. Failure forfeits booking.</div>
                    <div className="mb-4"><strong className="text-on-surface">5. FUEL POLICY</strong><br />Vehicles provided with full tank — return with full tank.</div>
                    <div className="mb-4"><strong className="text-on-surface">6. DAMAGE POLICY</strong><br />Customer fully responsible for any damage during rental.</div>
                    <div className="mb-4"><strong className="text-on-surface">7. TRAFFIC VIOLATIONS</strong><br />All fines/challans during rental are customer's responsibility.</div>
                    <div className="mb-4"><strong className="text-on-surface">8. RETURN TIME</strong><br />Return by agreed time. Late returns charged at hourly rate.</div>
                    <div className="mb-4"><strong className="text-on-surface">9. PROHIBITED USE</strong><br />No illegal activities, sub-renting, racing, or unauthorized off-road use.</div>
                    <div><strong className="text-on-surface">10. SIGNATURE AGREEMENT</strong><br />Your signature confirms acceptance of all terms above.</div>
                  </div>

                  <div className="flex items-start gap-2.5 mb-4 cursor-pointer"
                    onClick={() => setAgreedTerms(v => !v)}>
                    <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreedTerms ? 'bg-secondary border-secondary' : 'bg-surface-variant border-outline'}`}>
                      {agreedTerms && <span className="text-[#111]"><CheckIcon /></span>}
                    </div>
                    <span className="text-[12px] text-on-surface-variant leading-relaxed">
                      I have read and agree to the Terms & Conditions. The advance payment is non-refundable.
                    </span>
                  </div>

                  <div className="bg-[rgba(200,155,91,0.08)] border border-secondary/25 p-3.5 text-center mb-4">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1">Advance Payment</div>
                    <div className="font-headline-xl text-secondary" style={{ fontSize: '36px', letterSpacing: '0.02em' }}>
                      ₹{ADVANCE}
                    </div>
                  </div>

                  {payError && (
                    <div className="bg-red-50 border border-red-200/30 p-2.5 text-red-500 text-[12px] mb-3">
                      ❌ {payError}
                    </div>
                  )}

                  <button className={`w-full py-3.5 text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer transition-colors ${!agreedTerms || payProcessing ? 'bg-outline text-on-surface-variant cursor-not-allowed' : 'bg-secondary hover:bg-[#B08040]'}`}
                    disabled={!agreedTerms || payProcessing}
                    onClick={handlePay}>
                    {payProcessing ? (
                      <><span className="inline-block w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2 align-middle" />Processing...</>
                    ) : `Pay ₹${ADVANCE} Advance`}
                  </button>
                  <button className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest bg-none border-0 mt-2.5 cursor-pointer flex items-center gap-1.5 hover:text-on-surface transition-colors"
                    onClick={() => setStep(3)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                    Back
                  </button>
                </>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-green-50 border border-green-300 flex items-center justify-center mx-auto mb-4 text-green-500 text-2xl">✓</div>
                  <div className="font-headline-xl text-on-surface mb-1.5" style={{ fontSize: '32px', letterSpacing: '0.02em' }}>
                    Booking Confirmed!
                  </div>
                  <div className="text-[11px] font-bold tracking-widest text-secondary mb-4">REF# {bookingRef}</div>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mb-5">
                    Your <strong className="text-on-surface">{car.make} {car.model}</strong> is booked for pickup on{' '}
                    <strong className="text-on-surface">{pickupDate}</strong> at{' '}
                    <strong className="text-on-surface">{pickupTime}</strong>, return on{' '}
                    <strong className="text-on-surface">{returnDate}</strong>.
                    {pickupLocation && <><br />Pickup at <strong className="text-on-surface">📍 {pickupLocation}</strong>.</>}
                    <br /><strong className="text-secondary">{payAtCar ? 'Full amount' : 'Advance of ₹' + ADVANCE}</strong> {payAtCar ? 'payable at car pickup.' : 'paid successfully.'}
                  </p>
                  <div className="h-px bg-outline mb-5 -mx-6" />
                  <Link to="/account"
                    className="block w-full py-3.5 bg-secondary text-[#111] font-bold text-[12px] uppercase tracking-widest text-center rounded-xl hover:bg-[#B08040] transition-colors">
                    View My Bookings
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}