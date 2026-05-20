import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SEO from '../components/SEO';
import { getInvoiceHtml } from '../utils/invoiceTemplate';
import html2canvas from 'html2canvas';

export default function BookingDetail() {
  const { id } = useParams();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) { navigate('/signin'); return; }
    const fetch = async () => {
      try {
        const res = await bookingAPI.getById(id);
        setBooking(res.data.data.booking);
      } catch { 
        setBooking(null); 
        toast.error('Booking details unavailable');
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, [id, customer, navigate]);

  const generateInvoice = async () => {
    if (!booking) return;

    const toastId = toast.loading('Preparing your invoice...');
    try {
      // 1. Create a visible but off-screen container
      const container = document.createElement('div');
      container.innerHTML = getInvoiceHtml(booking);
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '5000px'; // Move way off-screen but keep it rendered
      container.style.width = '800px';
      container.style.zIndex = '-9999';
      document.body.appendChild(container);

      // 2. Give it time to render and load the logo
      await new Promise(resolve => setTimeout(resolve, 1500));

      const page1 = container.querySelector('#page-1');
      const page2 = container.querySelector('#page-2');
      
      // 3. Capture with html2canvas (both pages)
      const canvas1 = await html2canvas(page1, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: 1120,
        windowWidth: 800
      });

      const canvas2 = await html2canvas(page2, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: 1120,
        windowWidth: 800
      });

      // 4. Convert to PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Add Page 1
      const imgData1 = canvas1.toDataURL('image/jpeg', 1.0);
      const pdfHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight1, '', 'FAST');

      // Add Page 2
      pdf.addPage();
      const imgData2 = canvas2.toDataURL('image/jpeg', 1.0);
      const pdfHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
      pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight2, '', 'FAST');

      pdf.save(`ModernDrive_Invoice_${booking._id?.slice(-6).toUpperCase()}.pdf`);

      // 5. Cleanup
      document.body.removeChild(container);
      toast.success('Invoice downloaded!', { id: toastId });
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error('Failed to generate invoice', { id: toastId });
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
    <div className="min-h-screen py-16 flex items-center justify-center" style={{ background: '#F9F8F3' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(25,19,14,0.15)', borderTopColor: '#19130E' }}></div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen py-20 px-6 text-center" style={{ background: '#F9F8F3' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#19130E' }}>Booking Not Found</h1>
      <Link to="/my-bookings" className="text-sm font-bold underline" style={{ color: '#19130E' }}>Back to My Bookings</Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 pt-32" style={{ background: '#F9F8F3' }}>
      <SEO title={`${booking.car?.make} ${booking.car?.model} | Booking Details`} noIndex />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <Link to="/my-bookings" className="flex items-center gap-2 no-underline" style={{ color: '#6b5e50' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </Link>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={booking.status === 'pending' ? { background: 'rgba(182,124,61,0.15)', color: '#8a6d2d' } :
              booking.status === 'confirmed' ? { background: 'rgba(25,19,14,0.08)', color: '#19130E' } :
              booking.status === 'active' ? { background: 'rgba(182,124,61,0.25)', color: '#7a5c24' } :
              booking.status === 'completed' ? { background: '#EBE6DE', color: '#6b5e50' } :
              { background: 'rgba(185,28,28,0.1)', color: '#b91c1c' }}>
            {booking.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-[12px] p-8 overflow-hidden" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <div className="flex items-start gap-6 mb-10">
                <div className="w-24 h-18 rounded-[8px] p-2 flex-shrink-0 overflow-hidden" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.1)' }}>
                  <img 
                    src={booking.car?.images?.[0]?.url || '/no-car-image.png'} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#19130E' }}>{booking.car?.make} {booking.car?.model}</h1>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#6b5e50' }}>
                    {booking.car?.category} · {booking.car?.transmission}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6b5e50' }}>Pick-up Date</p>
                  <p className="text-sm font-bold" style={{ color: '#19130E' }}>
                    {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6b5e50' }}>Drop-off Date</p>
                  <p className="text-sm font-bold" style={{ color: '#19130E' }}>
                    {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] p-8" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#6b5e50' }}>Booking Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#6b5e50' }}>Booking ID</span>
                  <span className="text-xs font-mono" style={{ color: '#19130E' }}>#{booking._id}</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#6b5e50' }}>Duration</span>
                  <span className="text-xs font-bold" style={{ color: '#19130E' }}>{booking.totalDays || 1} Day(s)</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                  <span className="text-xs" style={{ color: '#6b5e50' }}>Payment Status</span>
                  <span className="text-xs font-bold capitalize" style={{ color: '#19130E' }}>{booking.paymentStatus}</span>
                </div>
                {booking.promoCode && (
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(182,124,61,0.1)' }}>
                    <span className="text-xs" style={{ color: '#6b5e50' }}>Promo Applied</span>
                    <span className="text-xs font-bold text-green-600 uppercase">{booking.promoCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[12px] p-8" style={{ background: '#FFFFFF', border: '1px solid rgba(25,19,14,0.08)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: '#6b5e50' }}>Total Amount</h3>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs" style={{ color: '#6b5e50' }}>
                  <span>Subtotal</span>
                  <span className="font-bold" style={{ color: '#19130E' }}>₹{(booking.totalPrice + (booking.discountAmount || 0)).toLocaleString('en-IN')}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span>
                    <span>-₹{booking.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-4 border-t flex justify-between items-end" style={{ borderColor: 'rgba(182,124,61,0.15)' }}>
                  <span className="text-sm font-bold" style={{ color: '#19130E' }}>Total Paid</span>
                  <span className="text-2xl font-display font-bold tracking-tight" style={{ color: '#19130E' }}>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button
                onClick={generateInvoice}
                className="w-full py-4 text-xs font-bold rounded-[8px] flex items-center justify-center gap-2"
                style={{ background: '#19130E', color: '#FFFFFF' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Invoice
              </button>
            </div>

            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <button
                onClick={handleCancel}
                className="w-full py-4 text-xs font-bold rounded-[8px]"
                style={{ color: '#b91c1c', border: '1px solid rgba(185,28,28,0.15)' }}
              >
                Cancel Booking
              </button>
            )}

            <div className="rounded-[12px] p-6 text-center" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#6b5e50' }}>
                Need support? <br /> Call us at <a href="tel:+918792492717" className="font-bold underline" style={{ color: '#19130E' }}>+91 87924 92717</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
