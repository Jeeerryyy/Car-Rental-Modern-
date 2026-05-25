import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { bookingAPI } from '../services/api';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';


export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [razorpayKeyId, setRazorpayKeyId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getById(id);
        setBooking(res.data.data.booking);
        setRazorpayKeyId(res.data.data.razorpayKeyId);
      } catch (err) {
        console.error('Error fetching booking:', err);
        if (!booking) toast.error('Could not load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

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
          color: '#B67C3D',
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

  const generateInvoice = async () => {
    if (!booking) return;
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
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#F9F8F3' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(25,19,14,0.15)', borderTopColor: '#19130E' }}></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6" style={{ background: '#F9F8F3' }}>
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#19130E' }}>Booking Not Found</h1>
          <Link to="/my-bookings" className="text-sm font-bold underline" style={{ color: '#19130E' }}>Go to My Bookings</Link>
        </div>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'pay_at_car';

  return (
    <div className="min-h-screen pb-20 pt-32" style={{ background: '#F9F8F3' }}>
      <SEO title={isPaid ? "Confirmed | Modern Selfdrive" : "Complete Payment | Modern Selfdrive"} noIndex />

      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-12">
          {isPaid ? (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#19130E' }}>Booking Confirmed!</h1>
              <p className="text-sm" style={{ color: '#6b5e50' }}>Your ride is ready for your next adventure.</p>
            </>
          ) : (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(182,124,61,0.15)', color: '#B67C3D' }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </motion.div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#19130E' }}>Payment Pending</h1>
              <p className="text-sm" style={{ color: '#6b5e50' }}>To secure your ride, complete the advance payment.</p>
            </>
          )}
        </div>

        <div className="space-y-8 py-10 mb-10" style={{ borderTop: '1px solid rgba(182,124,61,0.15)', borderBottom: '1px solid rgba(182,124,61,0.15)' }}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Vehicle</span>
            <span className="text-sm font-bold text-right" style={{ color: '#19130E' }}>{booking.car?.make} {booking.car?.model}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Dates</span>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: '#19130E' }}>{new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-[10px] font-bold uppercase mt-1" style={{ color: '#6b5e50' }}>{booking.totalDays || 1} Day(s)</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Rental Price</span>
            <span className="text-sm font-bold" style={{ color: '#19130E' }}>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Security Deposit</span>
            <span className="text-sm font-bold" style={{ color: '#19130E' }}>₹{Number(booking.securityDeposit || 500).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Paid Amount</span>
            <span className="text-sm font-bold" style={{ color: '#19130E' }}>₹{Number(booking.amountPaid || (isPaid ? 500 : 0)).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: '#B67C3D' }}>Remaining Payable</span>
            <span className="text-lg font-bold" style={{ color: '#B67C3D' }}>
              ₹{Number(
                (booking.amountPaid || (isPaid ? 500 : 0)) >= (booking.securityDeposit || 500)
                  ? Math.max(0, booking.totalPrice - (booking.amountPaid || (isPaid ? 500 : 0)))
                  : (booking.totalPrice + (booking.securityDeposit || 500) - (booking.amountPaid || (isPaid ? 500 : 0)))
              ).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Booking ID</span>
            <span className="text-xs font-mono" style={{ color: '#6b5e50' }}>#{booking._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isPaid ? (
            <button 
              onClick={generateInvoice}
              className="w-full py-4 text-sm font-bold rounded-[8px] flex items-center justify-center gap-2"
              style={{ background: '#19130E', color: '#FFFFFF' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice
            </button>
          ) : (
            <button 
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full py-4 text-sm font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#B67C3D', color: '#19130E' }}
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
          
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/my-bookings" 
              className="py-4 text-sm font-bold rounded-[8px] text-center no-underline"
              style={{ background: '#F2EEE5', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}
            >
              My Bookings
            </Link>
            <Link 
              to="/" 
              className="py-4 text-sm font-bold rounded-[8px] text-center no-underline"
              style={{ background: '#F2EEE5', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}
            >
              Home
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] mt-12 px-6 leading-relaxed" style={{ color: '#6b5e50' }}>
          Need help? Contact our 24/7 support at <a href="tel:+919004460634" className="font-bold underline" style={{ color: '#19130E' }}>+91 90044 60634</a> or visit the support section.
        </p>
      </div>
    </div>
  );
}
