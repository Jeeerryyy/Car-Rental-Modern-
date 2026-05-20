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
    try { const res = await bookingAPI.getMyBookings(); setBookings(res.data.data || []); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!customer) { navigate('/signin'); return; } fetchBookings(); }, [customer, navigate]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const generateDemoInvoice = async () => {
    const toastId = toast.loading('Generating demo invoice...');
    const mockBooking = {
      _id: '663f1a2b3c4d5e6f7a8b9c0d', startDate: '2026-05-15T10:00:00Z', endDate: '2026-05-18T10:00:00Z',
      totalPrice: 9450, discountAmount: 1050, status: 'completed', totalDays: 3,
      car: { make: 'Toyota', model: 'Innova Crysta', year: 2024, category: 'Luxury MUV', pricePerDay: 3500, fuelType: 'Diesel', transmission: 'Automatic', registrationNumber: 'GJ-01-MD-1234' },
      customer: { name: 'John Doe', phone: '+91 98765 43210', email: 'john.doe@example.com' }
    };
    try {
      const container = document.createElement('div');
      container.innerHTML = getInvoiceHtml(mockBooking);
      container.style.position = 'fixed'; container.style.top = '0'; container.style.left = '5000px'; container.style.width = '800px'; container.style.zIndex = '-9999';
      document.body.appendChild(container);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const page1 = container.querySelector('#page-1'); const page2 = container.querySelector('#page-2');
      const opts = { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: 800, height: 1120, windowWidth: 800 };
      const canvas1 = await html2canvas(page1, opts); const canvas2 = await html2canvas(page2, opts);
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas1.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, pdfWidth, (canvas1.height * pdfWidth) / canvas1.width, '', 'FAST');
      pdf.addPage();
      pdf.addImage(canvas2.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, pdfWidth, (canvas2.height * pdfWidth) / canvas2.width, '', 'FAST');
      pdf.save('ModernDrive_Demo_Invoice.pdf');
      document.body.removeChild(container);
      toast.success('Demo invoice downloaded!', { id: toastId });
    } catch (error) { console.error('Invoice generation error:', error); toast.error('Failed to generate demo invoice', { id: toastId }); }
  };

  const handleCancel = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try { await bookingAPI.cancel(id); toast.success('Booking cancelled'); fetchBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cancellation failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center" style={{ background: '#F9F8F3' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(25,19,14,0.15)', borderTopColor: '#19130E' }}></div>
      </div>
    );
  }

  const statusBadgeStyle = (status) => {
    const map = {
      pending: { background: 'rgba(182,124,61,0.15)', color: '#8a6d2d' },
      confirmed: { background: 'rgba(25,19,14,0.08)', color: '#19130E' },
      active: { background: 'rgba(182,124,61,0.25)', color: '#7a5c24' },
      completed: { background: '#EBE6DE', color: '#6b5e50' },
      cancelled: { background: 'rgba(185,28,28,0.1)', color: '#b91c1c' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="min-h-screen pb-24 pt-32 px-6" style={{ background: '#F9F8F3' }}>
      <SEO title="My Bookings | Modern Selfdrive" />
      <div className="max-w-[800px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="mb-6 flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tighter uppercase leading-none" style={{ color: '#19130E' }}>Modern</span>
              <span className="text-base font-bold tracking-[0.2em] uppercase leading-none ml-0.5" style={{ color: '#B67C3D' }}>Selfdrive</span>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#19130E' }}>My Bookings</h1>
            <p className="text-sm" style={{ color: '#6b5e50' }}>Manage and track your car rental history.</p>
          </div>
          <button onClick={generateDemoInvoice} className="px-6 py-3 text-xs font-bold rounded-[8px] flex items-center gap-2"
            style={{ background: '#F2EEE5', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            View Demo Invoice
          </button>
        </div>

        <div className="flex gap-2 p-1 rounded-[12px] overflow-x-auto scrollbar-hide mb-8" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={filter === s ? { background: '#19130E', color: '#FFFFFF' } : { color: '#6b5e50' }}>
              {s}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-[12px] p-20 text-center" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: '#EBE6DE' }}>🚗</div>
            <p className="font-medium mb-8" style={{ color: '#6b5e50' }}>You don't have any bookings in this category.</p>
            <Link to="/cars" className="btn-primary inline-flex px-10">Browse Fleet</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="relative">
                <Link to={`/my-bookings/${booking._id}`} className="block rounded-[12px] p-5 no-underline" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-18 rounded-[8px] p-2 overflow-hidden flex-shrink-0" style={{ background: '#EBE6DE', border: '1px solid rgba(182,124,61,0.1)' }}>
                      <img src={booking.car?.images?.[0]?.url || '/no-car.png'} alt="" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold truncate" style={{ color: '#19130E' }}>{booking.car?.make} {booking.car?.model}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter" style={statusBadgeStyle(booking.status)}>{booking.status}</span>
                      </div>
                      <p className="text-xs font-medium" style={{ color: '#6b5e50' }}>
                        {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block mr-4">
                      <p className="font-bold" style={{ color: '#19130E' }}>₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter mt-1" style={{ color: '#6b5e50' }}>Total Paid</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button onClick={(e) => handleCancel(e, booking._id)} className="px-3 py-1.5 text-[10px] font-bold rounded-[6px]" style={{ background: 'rgba(185,28,28,0.1)', color: '#b91c1c' }}>Cancel</button>
                      )}
                      <div className="self-end p-2 rounded-full" style={{ background: '#EBE6DE', color: '#19130E' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
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
