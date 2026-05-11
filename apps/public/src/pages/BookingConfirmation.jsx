import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { bookingAPI } from '../services/api';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const generateInvoice = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Premium Header
    doc.setFillColor(33, 33, 33);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MODERN SELFDRIVE', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', pageWidth - 40, 25);

    // Metadata Section
    doc.setTextColor(40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TO:', 20, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.text(booking.customer?.name || 'Customer Name', 20, 62);
    doc.text(booking.customer?.phone || '+91 XXXXX XXXXX', 20, 67);
    doc.text(booking.customer?.email || 'customer@example.com', 20, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS:', pageWidth - 80, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: INV-${booking._id.slice(-8).toUpperCase()}`, pageWidth - 80, 62);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 80, 67);
    doc.text(`Status: ${booking.status.toUpperCase()}`, pageWidth - 80, 72);

    // Vehicle Details Sub-header
    doc.setDrawColor(230);
    doc.line(20, 80, pageWidth - 20, 80);
    
    doc.setFont('helvetica', 'bold');
    doc.text('VEHICLE DETAILS', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`${booking.car?.make} ${booking.car?.model} (${booking.car?.transmission} · ${booking.car?.fuelType})`, 20, 97);
    doc.text(`Category: ${booking.car?.category}`, 20, 103);

    // Table
    const tableData = [
      ['Description', 'Quantity', 'Rate', 'Amount'],
      [
        `Car Rental (${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()})`,
        `${booking.totalDays || 1} Day(s)`,
        `₹${booking.car?.pricePerDay}`,
        `₹${(booking.car?.pricePerDay * (booking.totalDays || 1)).toLocaleString('en-IN')}`
      ],
      ['Discount Applied', '', '', `-₹${(booking.discountAmount || 0).toLocaleString('en-IN')}`],
    ];

    doc.autoTable({
      startY: 115,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 5, fontSize: 9 },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Paid:', pageWidth - 80, finalY + 15);
    doc.setFontSize(16);
    doc.text(`₹${booking.totalPrice.toLocaleString('en-IN')}`, pageWidth - 80, finalY + 25);

    // Footer
    doc.setDrawColor(240);
    doc.line(20, finalY + 40, pageWidth - 20, finalY + 40);
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Terms & Conditions:', 20, finalY + 50);
    doc.text('1. Vehicle should be returned in the same condition as received.', 20, finalY + 55);
    doc.text('2. Security deposit is refundable after 24 hours of car return.', 20, finalY + 60);
    doc.text('For support, call +91 87924 92717 or email support@modernselfdrive.in', 20, finalY + 70);

    doc.save(`Modern_Selfdrive_Invoice_${booking._id.slice(-8).toUpperCase()}.pdf`);
    toast.success('Premium Invoice downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-dark mb-4">Booking Not Found</h1>
          <Link to="/my-bookings" className="text-sm font-bold underline">Go to My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-32">
      <SEO title="Confirmed | Modern Selfdrive" noIndex />

      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-dark mb-2">Booking Confirmed!</h1>
          <p className="text-muted text-sm">Your ride is ready for your next adventure.</p>
        </div>

        <div className="space-y-8 border-y border-gray-100 py-10 mb-10">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Vehicle</span>
            <span className="text-sm font-bold text-dark text-right">{booking.car?.make} {booking.car?.model}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Dates</span>
            <div className="text-right">
              <p className="text-sm font-bold text-dark">{new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-[10px] text-muted font-bold uppercase mt-1">{booking.totalDays || 1} Day(s)</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Total Paid</span>
            <span className="text-xl font-bold text-dark">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Booking ID</span>
            <span className="text-xs font-mono text-muted">#{booking._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={generateInvoice}
            className="w-full py-4 bg-dark text-white text-sm font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Invoice
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/my-bookings" 
              className="py-4 bg-off text-dark text-sm font-bold rounded-xl text-center hover:bg-gray-100 transition-all"
            >
              My Bookings
            </Link>
            <Link 
              to="/" 
              className="py-4 bg-off text-dark text-sm font-bold rounded-xl text-center hover:bg-gray-100 transition-all"
            >
              Home
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted mt-12 px-6 leading-relaxed">
          Need help? Contact our 24/7 support at <a href="tel:+918792492717" className="text-dark font-bold underline">+91 87924 92717</a> or visit the support section.
        </p>
      </div>
    </div>
  );
}