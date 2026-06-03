import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';


export default function BookingDetail() {
  const { id } = useParams();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!customer) { navigate('/signin'); return; }
    const fetch = async () => {
      try {
        const res = await bookingAPI.getById(id);
        setBooking(res.data.data.booking);
        setRazorpayKeyId(res.data.data.razorpayKeyId);
      } catch { 
        setBooking(null); 
        toast.error('Booking details unavailable');
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, [id, customer, navigate]);

  const handlePayment = async () => {
    if (!booking) return;
    setPaymentLoading(true);

    const orderId = booking.razorpayOrderId;
    const amount = 500 * 100; // ₹500 advance in paise
    const keyId = razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

    // Check if mock mode is active
    const isMock = !orderId || orderId.startsWith('mock_order_') || !keyId || keyId === 'your-razorpay-key-id';

    if (isMock) {
      const toastId = toast.loading('Processing sandbox payment...');
      setTimeout(async () => {
        try {
          const verifyRes = await bookingAPI.verifyPayment({
            bookingId: booking._id,
            razorpayOrderId: orderId || `mock_order_${Date.now()}`,
            razorpayPaymentId: `mock_pay_${Date.now()}`,
            razorpaySignature: 'mock_sig'
          });
          toast.success('Sandbox Payment Verified!', { id: toastId });
          const updatedBooking = verifyRes.data.data.booking || verifyRes.data.data;
          setBooking(updatedBooking);
        } catch (err) {
          console.error('Payment verification failed:', err);
          toast.error('Sandbox verification failed', { id: toastId });
        } finally {
          setPaymentLoading(false);
        }
      }, 1500);
      return;
    }

    // Real Razorpay Checkout
    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Modern Selfdrive',
        description: 'Advance Payment to Secure Booking',
        order_id: orderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: booking.phone || '',
        },
        theme: {
          color: '#A56A43',
        },
        handler: async (response) => {
          const toastId = toast.loading('Verifying payment signature...');
          try {
            const verifyRes = await bookingAPI.verifyPayment({
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment Secured! Booking Confirmed.', { id: toastId });
            const updatedBooking = verifyRes.data.data.booking || verifyRes.data.data;
            setBooking(updatedBooking);
          } catch (err) {
            console.error('Verify Signature Error:', err);
            toast.error(err.response?.data?.message || 'Signature verification failed', { id: toastId });
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled. To secure your ride, complete the payment.');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      toast.error(err.message || 'Failed to open Razorpay checkout');
      setPaymentLoading(false);
    }
  };



  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen py-16 flex items-center justify-center" style={{ background: '#F4F1EA' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,18,0.15)', borderTopColor: '#121212' }}></div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen py-20 px-6 text-center" style={{ background: '#F4F1EA' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#121212' }}>Booking Not Found</h1>
      <Link to="/my-bookings" className="text-sm font-bold underline" style={{ color: '#121212' }}>Back to My Bookings</Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 pt-32" style={{ background: '#F4F1EA' }}>
      <SEO title={`${booking.car?.make} ${booking.car?.model} | Booking Details`} noIndex />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <Link to="/my-bookings" className="flex items-center gap-2 no-underline" style={{ color: '#5C5C5C' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </Link>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={booking.status === 'pending' ? { background: '#D6D0C7', color: '#9B6A3C' } :
              booking.status === 'confirmed' ? { background: '#DDE8DE', color: '#121212' } :
              booking.status === 'active' ? { background: '#DDE8DE', color: '#556B57' } :
              booking.status === 'completed' ? { background: '#E7E0D4', color: '#5C5C5C' } :
              { background: '#F0D9D6', color: '#9C4B45' }}>
            {booking.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-[12px] p-8 overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <div className="flex items-start gap-6 mb-10">
                <div className="w-24 h-18 rounded-[8px] p-2 flex-shrink-0 overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                  <img 
                    src={booking.car?.images?.[0]?.url || '/no-car-image.png'} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#121212' }}>{booking.car?.make} {booking.car?.model}</h1>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#5C5C5C' }}>
                    {booking.car?.category} · {booking.car?.transmission}{booking.car?.color ? ` · ${booking.car?.color}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8" style={{ borderTop: '1px solid #D6D0C7' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5C5C' }}>Pick-up Date</p>
                  <p className="text-sm font-bold" style={{ color: '#121212' }}>
                    {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5C5C' }}>Drop-off Date</p>
                  <p className="text-sm font-bold" style={{ color: '#121212' }}>
                    {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] p-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#5C5C5C' }}>Booking Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#5C5C5C' }}>Booking ID</span>
                  <span className="text-xs font-mono" style={{ color: '#121212' }}>#{booking._id}</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#5C5C5C' }}>Duration</span>
                  <span className="text-xs font-bold" style={{ color: '#121212' }}>{booking.totalDays || 1} Day(s)</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#5C5C5C' }}>Payment Status</span>
                  <span className="text-xs font-bold capitalize" style={{ color: '#121212' }}>{booking.paymentStatus}</span>
                </div>
                {booking.promoCode && (
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                    <span className="text-xs" style={{ color: '#5C5C5C' }}>Promo Applied</span>
                    <span className="text-xs font-bold text-green-600 uppercase">{booking.promoCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[12px] p-8" style={{ background: '#FFFFFF', border: '1px solid #DDE8DE', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: '#5C5C5C' }}>Payment Summary</h3>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs" style={{ color: '#5C5C5C' }}>
                  <span>Subtotal</span>
                  <span className="font-bold" style={{ color: '#121212' }}>₹{(booking.totalPrice + (booking.discountAmount || 0)).toLocaleString('en-IN')}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span>
                    <span>-₹{booking.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs" style={{ color: '#5C5C5C' }}>
                  <span>Security Deposit</span>
                  <span className="font-bold" style={{ color: '#121212' }}>₹{Number(booking.securityDeposit || 500).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#5C5C5C' }}>
                  <span>Paid Amount</span>
                  <span className="font-bold" style={{ color: '#121212' }}>₹{Number(booking.amountPaid || (booking.paymentStatus === 'paid' ? 500 : 0)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#5C5C5C' }}>
                  <span>Remaining Payable</span>
                  <span className="font-bold text-primary">
                    ₹{Number(
                      (booking.amountPaid || (booking.paymentStatus === 'paid' ? 500 : 0)) >= (booking.securityDeposit || 500)
                        ? Math.max(0, booking.totalPrice - (booking.amountPaid || (booking.paymentStatus === 'paid' ? 500 : 0)))
                        : (booking.totalPrice + (booking.securityDeposit || 500) - (booking.amountPaid || (booking.paymentStatus === 'paid' ? 500 : 0)))
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-4 border-t flex justify-between items-end" style={{ borderColor: '#D6D0C7' }}>
                  <span className="text-sm font-bold" style={{ color: '#121212' }}>Total Rent</span>
                  <span className="text-2xl font-display font-bold tracking-tight" style={{ color: '#121212' }}>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              {booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full mt-4 py-4 text-xs font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: '#A56A43', color: '#121212' }}
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Pay ₹500 Advance Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Download Invoice Button */}
            {['confirmed', 'active', 'completed'].includes(booking.status) && (
              <button
                onClick={async () => {
                  try {
                    const res = await bookingAPI.getInvoiceHTML(booking._id);
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(res.data);
                      newWindow.document.close();
                    } else {
                      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
                    }
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to load invoice');
                  }
                }}
                className="w-full cursor-pointer group relative flex gap-1.5 px-8 py-4 bg-black bg-opacity-80 text-[#f1f1f1] rounded-3xl hover:bg-opacity-70 transition font-semibold shadow-md items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="20px" width="20px">
                  <g strokeWidth="0" id="SVGRepo_bgCarrier" />
                  <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier" />
                  <g id="SVGRepo_iconCarrier">
                    <g id="Interface / Download">
                      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#f1f1f1" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" id="Vector" />
                    </g>
                  </g>
                </svg>
                Download Invoice
                <div className="absolute opacity-0 -bottom-full rounded-md py-2 px-2 bg-black bg-opacity-70 left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity shadow-lg text-[10px] pointer-events-none whitespace-nowrap">
                  Download Invoice
                </div>
              </button>
            )}

            {booking.status === 'cancelled' && (booking.cancelledBy || booking.cancellationReason) && (
              <div className="rounded-[12px] p-6" style={{ background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)' }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9C4B45' }}>Cancellation Details</h3>
                <div className="space-y-3">
                  {booking.cancelledBy && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: '#5C5C5C' }}>Cancelled By</span>
                      <span className="text-xs font-bold capitalize" style={{ color: '#9C4B45' }}>{booking.cancelledBy}</span>
                    </div>
                  )}
                  {booking.cancellationReason && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: '#5C5C5C' }}>Reason</span>
                      <span className="text-xs font-bold" style={{ color: '#121212' }}>
                        {{ invalid_documents: 'Invalid Documents', vehicle_not_available: 'Vehicle Not Available', customer_no_show: 'Customer No-Show', payment_issue: 'Payment Issue', other: 'Other' }[booking.cancellationReason] || booking.cancellationReason}
                      </span>
                    </div>
                  )}
                  {booking.cancellationNote && (
                    <div className="pt-3" style={{ borderTop: '1px solid #F0D9D6' }}>
                      <p className="text-xs italic" style={{ color: '#5C5C5C' }}>"{booking.cancellationNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <button
                onClick={handleCancel}
                className="w-full py-4 text-xs font-bold rounded-[8px]"
                style={{ color: '#9C4B45', border: '1px solid rgba(185,28,28,0.15)' }}
              >
                Cancel Booking
              </button>
            )}

            <div className="rounded-[12px] p-6 text-center" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#5C5C5C' }}>
                Need support? <br /> Call us at <a href="tel:+919004460634" className="font-bold underline" style={{ color: '#121212' }}>+91 90044 60634</a> / <a href="tel:+918469265000" className="font-bold underline" style={{ color: '#121212' }}>+91 8469265000</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
