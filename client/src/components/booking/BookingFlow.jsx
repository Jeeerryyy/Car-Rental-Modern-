import { useState, useRef } from 'react';
import {
  XIcon, CheckIcon, UploadIcon, ShieldCheckIcon,
  ChevronRightIcon, ChevronLeftIcon, CarIcon, DownloadIcon
} from '../ui/Icons';
import api from '../../services/api';
import SignatureCanvas from 'react-signature-canvas';
import { useDropzone } from 'react-dropzone';

const calcDays = (a, b) => {
  if (!a || !b) return 0;
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86_400_000));
};

const fmt = (n) => Number(n).toLocaleString('en-IN');

const BookingFlow = ({ car, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  const [form, setForm] = useState({
    pickupDate: '', dropoffDate: '',
    pickupLocation: 'Modern Selfdrive Hub, Junagadh',
    driverRequired: false,
    aadhaarFiles: [], drivingLicenseFiles: [],
    termsAccepted: false,
    promoCode: '',
  });

  const [promo, setPromo] = useState({
    code: '',
    discount: 0,
    loading: false,
    error: null,
    applied: false
  });

  const sigPad = useRef(null);
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const days = calcDays(form.pickupDate, form.dropoffDate);
  const base = days * car.pricePerDay;
  const driver = form.driverRequired ? days * 500 : 0;
  const deposit = Number(car.securityDeposit) || 5000;
  const totalBeforeDiscount = base + driver;
  const total = Math.max(0, totalBeforeDiscount - promo.discount);
  const payNow = total + deposit;

  const validatePromo = async () => {
    if (!form.promoCode) return;
    setPromo(p => ({ ...p, loading: true, error: null }));
    try {
      const { data } = await api.post('/api/promos/validate', {
        code: form.promoCode,
        bookingAmount: base
      });
      if (data.success) {
        setPromo({
          code: data.code,
          discount: data.discountAmount,
          loading: false,
          error: null,
          applied: true
        });
      }
    } catch (err) {
      setPromo({
        code: '',
        discount: 0,
        loading: false,
        error: err.response?.data?.error || 'Invalid promo code',
        applied: false
      });
    }
  };

  const removePromo = () => {
    setPromo({ code: '', discount: 0, loading: false, error: null, applied: false });
    set({ promoCode: '' });
  };

  const { getRootProps: getAadhaarProps, getInputProps: getAadhaarInput } = useDropzone({
    onDrop: (files) => set({ aadhaarFiles: files.map(f => ({ file: f, name: f.name })) }),
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxFiles: 2,
  });

  const { getRootProps: getDLProps, getInputProps: getDLInput } = useDropzone({
    onDrop: (files) => set({ drivingLicenseFiles: files.map(f => ({ file: f, name: f.name })) }),
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxFiles: 2,
  });

  const createBooking = async () => {
    if (!form.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    if (form.aadhaarFiles.length === 0 || form.drivingLicenseFiles.length === 0) {
      alert('Please upload both Aadhaar and Driving License');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let signatureData = '';
      try {
        if (sigPad.current) {
          const canvas = sigPad.current.getTrimmedCanvas();
          if (canvas) {
            signatureData = canvas.toDataURL('image/png');
          }
        }
      } catch (sigErr) {
      }
      
      const { data } = await api.post('/api/bookings', {
        carId: car._id,
        pickupDate: form.pickupDate,
        dropoffDate: form.dropoffDate,
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.pickupLocation,
        driverRequired: Boolean(form.driverRequired),
        promoCode: promo.applied ? promo.code : undefined,
        paymentMethod: 'Pending',
      });

      setBooking(data);
      setStep(3);
    } catch (err) {
      const errorData = err.response?.data;
      let errorMsg = 'Booking failed. Please try again.';
      if (errorData?.error) {
        errorMsg = errorData.error;
      } else if (errorData?.details) {
        errorMsg = errorData.details.map(d => d.field + ': ' + d.message).join(', ');
      }
      alert('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const leftMargin = 15;
    const rightMargin = 195;

    const fmt = (n) => Math.round(Number(n) || 0);
    const inr = (n) => '₹' + fmt(n).toLocaleString('en-IN');

    doc.setFillColor(17, 17, 24);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(232, 224, 208);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MODERN SELFDRIVE', leftMargin + 5, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Car Rental Services', leftMargin + 5, 25);

    doc.setFontSize(8);
    doc.text('Modern Selfdrive Hub, Junagadh', rightMargin, 12, { align: 'right' });
    doc.text('+91 87924 92717', rightMargin, 18, { align: 'right' });

    doc.setFillColor(246, 245, 242);
    doc.rect(0, 35, pageWidth, 15, 'F');
    doc.setTextColor(17, 17, 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BOOKING CONFIRMATION', 105, 43, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Booking ID: ' + booking.confirmationNumber, 105, 48, { align: 'center' });

    let y = 60;
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(leftMargin, y, 180, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Booking Details', leftMargin + 5, y + 5.5);
    y += 12;

    doc.setTextColor(17, 17, 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Vehicle: ' + car.make + ' ' + car.model, leftMargin + 5, y);
    doc.text('Pickup: ' + new Date(booking.pickupDate).toLocaleDateString('en-IN'), rightMargin, y, { align: 'right' });
    y += 7;
    doc.text('Return: ' + new Date(booking.dropoffDate).toLocaleDateString('en-IN'), leftMargin + 5, y);
    doc.text('Days: ' + days, rightMargin, y, { align: 'right' });

    y += 15;
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(leftMargin, y, 180, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', leftMargin + 5, y + 5.5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.text('Base Rental', leftMargin + 5, y);
    doc.text(inr(base), rightMargin, y, { align: 'right' });
    y += 7;
    if (booking.discountAmount > 0) {
      doc.text('Discount (' + booking.promoCode + ')', leftMargin + 5, y);
      doc.text('-' + inr(booking.discountAmount), rightMargin, y, { align: 'right' });
      y += 7;
    }
    doc.text('Security Deposit', leftMargin + 5, y);
    doc.text(inr(deposit), rightMargin, y, { align: 'right' });
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin + 5, y, rightMargin - 5, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Paid', leftMargin + 5, y);
    doc.text(inr(payNow), rightMargin, y, { align: 'right' });

    y += 20;
    doc.setFillColor(17, 17, 24);
    doc.rect(0, 270, pageWidth, 27, 'F');
    doc.setTextColor(200, 195, 180);
    doc.setFontSize(8);
    doc.text('Thank you for choosing Modern Selfdrive!', 105, 280, { align: 'center' });
    doc.text('Powered by Modern Selfdrive', 105, 286, { align: 'center' });

    doc.save('Receipt-' + booking.confirmationNumber + '.pdf');
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-dark p-6 flex justify-between items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Book Your Ride</h2>
            <p className="text-accent text-sm">{car.make} {car.model} • ₹{fmt(car.pricePerDay)}/day</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="bg-off px-6 py-4 flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-dark text-white' : 'bg-border text-muted'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm font-medium ${step >= s ? 'text-dark' : 'text-muted'}`}>
                {s === 1 ? 'Dates' : s === 2 ? 'Documents' : 'Confirm'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-border ml-2"></div>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted tracking-wider">Pickup Date</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-border rounded-xl p-4 text-dark font-medium focus:border-dark focus:outline-none transition-colors"
                    value={form.pickupDate}
                    onChange={e => set({ pickupDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted tracking-wider">Return Date</label>
                  <input type="date" min={form.pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-border rounded-xl p-4 text-dark font-medium focus:border-dark focus:outline-none transition-colors"
                    value={form.dropoffDate}
                    onChange={e => set({ dropoffDate: e.target.value })} />
                </div>
              </div>

              <label className="flex items-center gap-4 p-5 bg-off rounded-xl border-2 border-border hover:border-dark cursor-pointer transition-all">
                <input type="checkbox" className="w-5 h-5 accent-dark"
                  checked={form.driverRequired}
                  onChange={e => set({ driverRequired: e.target.checked })} />
                <div>
                  <span className="font-bold text-dark">Professional Driver</span>
                  <span className="text-muted ml-2">+₹500/day</span>
                  <p className="text-xs text-muted mt-1">Experienced chauffeur for hassle-free journey</p>
                </div>
              </label>

              {/* Promo Code Entry */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted tracking-wider">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Enter code (e.g. MODERN10)"
                      className={`w-full border-2 rounded-xl p-4 text-dark font-medium focus:outline-none transition-colors ${
                        promo.applied ? 'border-green-500 bg-green-50' : promo.error ? 'border-red-500 bg-red-50' : 'border-border focus:border-dark'
                      }`}
                      value={form.promoCode}
                      onChange={e => set({ promoCode: e.target.value.toUpperCase() })}
                      disabled={promo.applied}
                    />
                    {promo.applied && <CheckIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2" />}
                  </div>
                  {!promo.applied ? (
                    <button 
                      onClick={validatePromo}
                      disabled={!form.promoCode || promo.loading}
                      className="bg-dark text-white px-6 rounded-xl font-bold hover:bg-dark/90 disabled:opacity-50 transition-colors"
                    >
                      {promo.loading ? '...' : 'Apply'}
                    </button>
                  ) : (
                    <button 
                      onClick={removePromo}
                      className="bg-red-50 text-red-600 px-6 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {promo.error && <p className="text-xs text-red-600 font-medium ml-1">{promo.error}</p>}
                {promo.applied && <p className="text-xs text-green-600 font-medium ml-1">Success! ₹{fmt(promo.discount)} discount applied.</p>}
              </div>

              <div className="bg-off rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <CarIcon className="w-6 h-6 text-muted" />
                  <div>
                    <p className="font-bold text-dark">{car.make} {car.model}</p>
                    <p className="text-xs text-muted">{car.transmission} • {car.fuelType}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between"><span className="text-muted">Rental ({days} days × ₹{fmt(car.pricePerDay)})</span><span className="font-bold">₹{fmt(base)}</span></div>
                  {driver > 0 && <div className="flex justify-between"><span className="text-muted">Driver ({days} days)</span><span className="font-bold">₹{fmt(driver)}</span></div>}
                  {promo.applied && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount ({promo.code})</span>
                      <span>-₹{fmt(promo.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span className="text-muted">Security Deposit (Refundable)</span><span className="font-bold">₹{fmt(deposit)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between text-lg">
                    <span className="font-bold text-dark">Total Amount</span><span className="font-bold text-dark">₹{fmt(payNow)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-dark flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                    Aadhaar Card
                  </label>
                  <div {...getAadhaarProps()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-dark hover:bg-off transition-all bg-white">
                    <input {...getAadhaarInput()} />
                    <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted" />
                    <p className="text-sm text-muted font-medium">Drop or click</p>
                    <p className="text-xs text-muted mt-1">JPG, PNG, PDF</p>
                  </div>
                  {form.aadhaarFiles.length > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{form.aadhaarFiles[0].name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-dark flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                    Driving License
                  </label>
                  <div {...getDLProps()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-dark hover:bg-off transition-all bg-white">
                    <input {...getDLInput()} />
                    <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted" />
                    <p className="text-sm text-muted font-medium">Drop or click</p>
                    <p className="text-xs text-muted mt-1">JPG, PNG, PDF</p>
                  </div>
                  {form.drivingLicenseFiles.length > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{form.drivingLicenseFiles[0].name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-off rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheckIcon className="w-5 h-5 text-dark" />
                  <p className="font-bold text-dark">Terms & Conditions</p>
                </div>
                <ul className="text-sm text-muted space-y-2 mb-4">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Vehicle must be returned in same condition</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Security deposit refundable within 5-7 days</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Late return charges ₹200/hour</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Fuel cost borne by renter</li>
                </ul>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-border">
                  <input type="checkbox" className="w-5 h-5 accent-dark"
                    checked={form.termsAccepted}
                    onChange={e => set({ termsAccepted: e.target.checked })} />
                  <span className="font-medium text-dark">I accept the terms & conditions</span>
                  <button type="button" onClick={() => setShowTerms(true)} className="text-xs text-blue-600 font-medium ml-auto hover:underline">View T&C</button>
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-dark">Your Signature</label>
                <div className="border-2 border-border rounded-xl overflow-hidden bg-white">
                  <SignatureCanvas ref={sigPad} penColor="#111118" canvasProps={{ className: 'w-full h-40 cursor-crosshair' }} />
                </div>
                <button type="button" onClick={() => sigPad.current?.clear()} className="text-sm text-muted hover:text-dark">Clear Signature</button>
              </div>
            </div>
          )}

          {step === 3 && booking && (
            <div className="max-w-md mx-auto">
              {/* Success Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Booking Confirmed</h3>
                <p className="text-muted mt-1">Your booking has been successfully placed</p>
              </div>

              {/* Booking ID */}
              <div className="bg-dark rounded-xl p-4 text-center mb-4">
                <p className="text-xs text-accent uppercase tracking-wider mb-1">Booking ID</p>
                <p className="font-mono text-2xl font-bold text-white tracking-wider">{booking.confirmationNumber}</p>
              </div>

              {/* Car Details */}
              <div className="bg-off rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-dark mb-3 pb-2 border-b border-border">Car Details</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-dark">{car.make} {car.model}</p>
                    <p className="text-sm text-muted">{car.year} • {car.transmission}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Per Day</p>
                    <p className="font-bold text-dark">₹{fmt(car.pricePerDay)}</p>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-off rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-dark mb-3 pb-2 border-b border-border">Rental Period</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted uppercase">Pickup</p>
                    <p className="font-bold text-dark">{new Date(booking.pickupDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase">Return</p>
                    <p className="font-bold text-dark">{new Date(booking.dropoffDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between">
                  <span className="text-muted">Total Days</span>
                  <span className="font-bold">{days} Days</span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-off rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-dark mb-3 pb-2 border-b border-border">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Base Rental ({days} days)</span>
                    <span>₹{fmt(base)}</span>
                  </div>
                  {driver > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Driver Charge</span>
                      <span>₹{fmt(driver)}</span>
                    </div>
                  )}
                  {booking.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({booking.promoCode})</span>
                      <span>-₹{fmt(booking.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">Security Deposit</span>
                    <span>₹{fmt(deposit)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-dark">Total Paid</span>
                  <span className="text-xl font-bold text-dark">₹{fmt(payNow)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={downloadReceipt} className="flex-1 btn-outline py-3">
                  Download Receipt
                </button>
                <button onClick={() => onComplete && onComplete(booking)} className="flex-1 btn-primary py-3">
                  View Bookings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-off/50 flex justify-between items-center">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 font-bold text-muted hover:text-dark">
              <ChevronLeftIcon className="w-4 h-4" /> Back
            </button>
          )}
          <div className="ml-auto">
            {step === 1 && (
              <button onClick={() => setStep(2)} disabled={!form.pickupDate || !form.dropoffDate}
                className="btn-primary !py-3 !px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                Continue <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button onClick={createBooking} disabled={loading || !form.termsAccepted || form.aadhaarFiles.length === 0 || form.drivingLicenseFiles.length === 0}
                className="btn-primary !py-3 !px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : 'Confirm Booking'} <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-dark">
              <h3 className="text-lg font-bold text-white">Terms & Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-white/10 rounded-full">
                <XIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm space-y-4">
              <p className="font-bold text-dark">1. Vehicle Condition</p>
              <p className="text-muted">The vehicle must be returned in the same condition as delivered. Any damage beyond normal wear and tear will be charged.</p>
              
              <p className="font-bold text-dark">2. Security Deposit</p>
              <p className="text-muted">A refundable security deposit is required at pickup. This will be refunded within 5-7 business days after vehicle inspection, minus any damages or violations.</p>
              
              <p className="font-bold text-dark">3. Late Return Charges</p>
              <p className="text-muted">Late return charges are ₹200 per hour. Please return the vehicle on time to avoid additional fees.</p>
              
              <p className="font-bold text-dark">4. Fuel Policy</p>
              <p className="text-muted">Fuel cost is borne by the renter. Please return the vehicle with the same fuel level as at pickup.</p>
              
              <p className="font-bold text-dark">5. Documents Required</p>
              <p className="text-muted">Valid Driving License and Aadhaar Card must be presented at pickup. Both original documents are mandatory.</p>
              
              <p className="font-bold text-dark">6. Speed Limit</p>
              <p className="text-muted">Maximum speed limit is 80 km/h. Violation penalty is ₹500 per instance.</p>
              
              <p className="font-bold text-dark">7. Cancellation Policy</p>
              <p className="text-muted">Free cancellation up to 24 hours before pickup. No refund for cancellations within 24 hours.</p>
              
              <p className="font-bold text-dark">8. Insurance</p>
              <p className="text-muted">The hirer is liable for the first ₹10,000 of any damage claim. Comprehensive insurance is provided for the rental period.</p>
            </div>
            <div className="p-4 border-t border-border">
              <button onClick={() => setShowTerms(false)} className="btn-primary w-full">I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;