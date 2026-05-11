import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SEO from '../components/SEO';

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
