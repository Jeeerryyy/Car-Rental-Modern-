import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getInvoiceHtml } from '../utils/invoiceTemplate';
import html2canvas from 'html2canvas';

function MyBookings() {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customer) { navigate('/signin'); return; }
    fetchBookings();
  }, [customer, navigate]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const generateDemoInvoice = async () => {
    const toastId = toast.loading('Generating demo invoice...');
    
    // Create a mock booking for the demo
    const mockBooking = {
      _id: '663f1a2b3c4d5e6f7a8b9c0d',
      startDate: '2026-05-15T10:00:00Z',
      endDate: '2026-05-18T10:00:00Z',
      totalPrice: 9450,
      discountAmount: 1050,
      status: 'completed',
      totalDays: 3,
      car: {
        make: 'Toyota',
        model: 'Innova Crysta',
        year: 2024,
        category: 'Luxury MUV',
        pricePerDay: 3500,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        registrationNumber: 'GJ-01-MD-1234'
      },
      customer: {
        name: 'John Doe',
        phone: '+91 98765 43210',
        email: 'john.doe@example.com'
      }
    };

    try {
      // 1. Create a visible but off-screen container
      const container = document.createElement('div');
      container.innerHTML = getInvoiceHtml(mockBooking);
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

      pdf.save('ModernDrive_Demo_Invoice.pdf');

      // 5. Cleanup
      document.body.removeChild(container);
      toast.success('Demo invoice downloaded!', { id: toastId });
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error('Failed to generate demo invoice', { id: toastId });
    }
  };

  const handleCancel = async (e, id) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation();
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off pb-24 pt-32 px-6">
      <SEO title="My Bookings | Modern Selfdrive" />
      <div className="max-w-[800px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="mb-6 flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tighter text-dark uppercase leading-none">Modern</span>
              <span className="text-base font-bold tracking-[0.2em] text-accent uppercase leading-none ml-0.5">Selfdrive</span>
            </div>
            <h1 className="text-3xl font-bold text-dark mb-2">My Bookings</h1>
            <p className="text-sm text-muted">Manage and track your car rental history.</p>
          </div>
          
          <button 
            onClick={generateDemoInvoice}
            className="px-6 py-3 bg-white border border-gray-200 text-dark text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Demo Invoice
          </button>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide mb-8">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${filter === s ? 'bg-dark text-white shadow-lg' : 'text-muted hover:text-dark hover:bg-off'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-off rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🚗</div>
            <p className="text-muted font-medium mb-8">You don't have any bookings in this category.</p>
            <Link to="/cars" className="btn-primary inline-flex px-10">Browse Fleet</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="relative group">
                <Link 
                  to={`/my-bookings/${booking._id}`}
                  className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-18 bg-off rounded-xl p-2 overflow-hidden flex-shrink-0 border border-gray-100">
                      <img 
                        src={booking.car?.images?.[0]?.url || '/no-car.png'} 
                        alt=""
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-dark truncate">{booking.car?.make} {booking.car?.model}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter
                          ${booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                            booking.status === 'active' ? 'bg-green-50 text-green-700' :
                            booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-50 text-red-700'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted font-medium">
                        {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="text-right hidden sm:block mr-4">
                      <p className="font-bold text-dark">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">Total Paid</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button 
                          onClick={(e) => handleCancel(e, booking._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <div className="self-end p-2 bg-off rounded-full group-hover:bg-dark group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
