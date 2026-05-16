import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { bookingAPI } from '../services/api';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getInvoiceHtml } from '../utils/invoiceTemplate';
import html2canvas from 'html2canvas';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getById(id);
        setBooking(res.data.data.booking);
      } catch (err) {
        console.error('Error fetching booking:', err);
        if (!booking) toast.error('Could not load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (id && (!booking || booking._id !== id)) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [id, booking]);

  const generateInvoice = async () => {
    if (!booking) return;

    const toastId = toast.loading('Preparing your invoice...');
    try {
      // 1. Create a visible but off-screen container
      const container = document.createElement('div');
      container.innerHTML = getInvoiceHtml(booking);
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '5000px'; 
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

  return (
    <div className="min-h-screen pb-20 pt-32" style={{ background: '#F9F8F3' }}>
      <SEO title="Confirmed | Modern Selfdrive" noIndex />

      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(182,124,61,0.15)', color: '#B67C3D' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#19130E' }}>Booking Confirmed!</h1>
          <p className="text-sm" style={{ color: '#6b5e50' }}>Your ride is ready for your next adventure.</p>
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
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Total Paid</span>
            <span className="text-xl font-bold" style={{ color: '#19130E' }}>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b5e50' }}>Booking ID</span>
            <span className="text-xs font-mono" style={{ color: '#6b5e50' }}>#{booking._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
