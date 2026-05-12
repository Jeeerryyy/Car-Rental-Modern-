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
    <div className="min-h-screen bg-white py-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-white py-20 px-6 text-center">
      <h1 className="text-2xl font-bold text-dark mb-4">Booking Not Found</h1>
      <Link to="/my-bookings" className="text-sm font-bold underline">Back to My Bookings</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-off pb-24 pt-32">
      <SEO title={`${booking.car?.make} ${booking.car?.model} | Booking Details`} noIndex />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <Link to="/my-bookings" className="flex items-center gap-2 text-muted hover:text-dark transition-all group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </Link>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest
            ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              booking.status === 'active' ? 'bg-green-100 text-green-800' :
              booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-start gap-6 mb-10">
                <div className="w-24 h-18 bg-off rounded-2xl p-2 flex-shrink-0 border border-gray-100 overflow-hidden">
                  <img 
                    src={booking.car?.images?.[0]?.url || '/no-car-image.png'} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark">{booking.car?.make} {booking.car?.model}</h1>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                    {booking.car?.category} · {booking.car?.transmission}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Pick-up Date</p>
                  <p className="text-sm font-bold text-dark">
                    {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Drop-off Date</p>
                  <p className="text-sm font-bold text-dark">
                    {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Booking Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-muted">Booking ID</span>
                  <span className="text-xs font-mono text-dark">#{booking._id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-muted">Duration</span>
                  <span className="text-xs font-bold text-dark">{booking.totalDays || 1} Day(s)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-muted">Payment Status</span>
                  <span className="text-xs font-bold text-dark capitalize">{booking.paymentStatus}</span>
                </div>
                {booking.promoCode && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-muted">Promo Applied</span>
                    <span className="text-xs font-bold text-green-600 uppercase">{booking.promoCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark rounded-3xl p-8 text-white shadow-xl shadow-dark">
              <h3 className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-6">Total Amount</h3>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Subtotal</span>
                  <span>₹{(booking.totalPrice + (booking.discountAmount || 0)).toLocaleString('en-IN')}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-400">
                    <span>Discount</span>
                    <span>-₹{booking.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-sm font-bold">Total Paid</span>
                  <span className="text-2xl font-display font-bold tracking-tight">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                onClick={generateInvoice}
                className="w-full py-4 bg-white text-dark text-xs font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
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
                className="w-full py-4 text-red-500 text-xs font-bold rounded-2xl hover:bg-red-50 transition-all border border-red-100"
              >
                Cancel Booking
              </button>
            )}

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-muted leading-relaxed">
                Need support? <br /> Call us at <a href="tel:+918792492717" className="text-dark font-bold underline">+91 87924 92717</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
