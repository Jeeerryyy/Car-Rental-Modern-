import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, updateBookingStatus } from '../api/bookings.js';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getInvoiceHtml } from '../utils/invoiceTemplate.js';
import * as XLSX from 'xlsx';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 }; // Show more on list
      if (filter !== 'all') params.status = filter;
      const res = await getBookings(params);
      setBookings(res.data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings();
      if (selectedBooking?._id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'active',
    active: 'completed',
  };

  const generateInvoice = async (booking) => {
    const toastId = toast.loading('Generating invoice...');
    try {
      // 1. Create a hidden container for rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.innerHTML = getInvoiceHtml(booking);
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

  const handleExportExcel = async () => {
    const toastId = toast.loading('Preparing export...');
    try {
      // Fetch all bookings (limited to 1000 for safety) matching current filter
      const params = { limit: 1000 };
      if (filter !== 'all') params.status = filter;
      const res = await getBookings(params);
      const allBookings = res.data.data || [];

      const exportData = allBookings.map(b => {
        const getLink = (url) => url ? { f: `HYPERLINK("${url}", "View Photo")` } : 'N/A';
        
        return {
          'Booking ID': b._id,
          'Status': b.status?.toUpperCase(),
          'Payment': b.paymentStatus?.toUpperCase(),
          'Customer Name': b.customer?.name || 'N/A',
          'Phone': b.customer?.phone || 'N/A',
          'Email': b.customer?.email || 'N/A',
          'Car': `${b.car?.make || ''} ${b.car?.model || ''}`,
          'Registration': b.car?.registrationNumber || 'N/A',
          'Pickup Date': b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : 'N/A',
          'Dropoff Date': b.endDate ? new Date(b.endDate).toLocaleDateString('en-IN') : 'N/A',
          'Total Days': b.totalDays || 0,
          'Base Price': b.totalPrice + (b.discountAmount || 0),
          'Discount': b.discountAmount || 0,
          'Total Paid': b.totalPrice,
          'Aadhaar Front': getLink(b.documents?.aadhaar?.front?.url || b.customer?.documents?.aadhaar?.front?.url),
          'Aadhaar Back': getLink(b.documents?.aadhaar?.back?.url || b.customer?.documents?.aadhaar?.back?.url),
          'License Front': getLink(b.documents?.license?.front?.url || b.customer?.documents?.license?.front?.url),
          'License Back': getLink(b.documents?.license?.back?.url || b.customer?.documents?.license?.back?.url),
          'Signature': getLink(b.signature?.url),
          'Booking Date': new Date(b.createdAt).toLocaleString('en-IN')
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length)) + 2
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `ModernDrive_Bookings_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel', { id: toastId });
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Bookings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage all your car rental bookings</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-dark rounded-xl text-xs font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px] text-muted">description</span>
          Export to Excel
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${filter === s ? 'bg-dark text-white' : 'bg-surface hover:bg-surface-tint'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <p className="text-on-surface-variant">No bookings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map(b => (
            <div 
              key={b._id} 
              onClick={() => setSelectedBooking(b)}
              className="p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-on-surface text-lg group-hover:text-primary transition-colors truncate">{b.customer?.name || 'Customer'}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      {b.customer?.email}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-on-surface">{b.car?.make} {b.car?.model}</span>
                      <span className="opacity-50">·</span>
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold">
                        {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'} – {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-outline-variant">
                  <div className="text-left sm:text-right">
                    <p className="font-black text-xl text-primary">₹{Number(b.totalPrice).toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${b.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {b.paymentStatus}
                    </p>
                  </div>
                  {nextStatus[b.status] ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(b._id, nextStatus[b.status]);
                      }}
                      className="px-6 py-3 text-sm font-bold bg-dark text-white rounded-xl hover:bg-black/90 transition-all active:scale-95 shadow-lg shadow-dark/10"
                    >
                      {nextStatus[b.status]}
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Side Panel */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full md:max-w-2xl bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low sticky top-0 z-20">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-primary">Booking Details</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusColors[selectedBooking.status] || 'bg-gray-100'}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <p className="text-secondary text-[10px] md:text-sm mt-1">ID: {selectedBooking._id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Customer Section */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider">Customer Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Name</p>
                    <p className="text-lg font-bold">{selectedBooking.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-lg font-bold">{selectedBooking.customer?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Email</p>
                    <p className="text-lg font-bold">{selectedBooking.customer?.email}</p>
                  </div>
                </div>

                {/* Documents & Signature */}
                {(selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url || selectedBooking.signature?.url) && (
                  <div className="mt-8 space-y-8">
                    <div>
                      <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Verification Documents</p>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url) && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aadhaar Card</p>
                            <div className="flex gap-2">
                              {/* Front */}
                              <a href={selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url} target="_blank" rel="noreferrer" className="block w-full h-24 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary transition-colors">
                                <img src={selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url} className="w-full h-full object-cover" alt="Aadhaar Front" />
                              </a>
                              {/* Back */}
                              {(selectedBooking.documents?.aadhaar?.back?.url || selectedBooking.customer?.documents?.aadhaar?.back?.url) && (
                                <a href={selectedBooking.documents?.aadhaar?.back?.url || selectedBooking.customer?.documents?.aadhaar?.back?.url} target="_blank" rel="noreferrer" className="block w-full h-24 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary transition-colors">
                                  <img src={selectedBooking.documents?.aadhaar?.back?.url || selectedBooking.customer?.documents?.aadhaar?.back?.url} className="w-full h-full object-cover" alt="Aadhaar Back" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        {(selectedBooking.documents?.license?.front?.url || selectedBooking.customer?.documents?.license?.front?.url) && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Driving License</p>
                            <div className="flex gap-2">
                              {/* Front */}
                              <a href={selectedBooking.documents?.license?.front?.url || selectedBooking.customer?.documents?.license?.front?.url} target="_blank" rel="noreferrer" className="block w-full h-24 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary transition-colors">
                                <img src={selectedBooking.documents?.license?.front?.url || selectedBooking.customer?.documents?.license?.front?.url} className="w-full h-full object-cover" alt="License Front" />
                              </a>
                              {/* Back */}
                              {(selectedBooking.documents?.license?.back?.url || selectedBooking.customer?.documents?.license?.back?.url) && (
                                <a href={selectedBooking.documents?.license?.back?.url || selectedBooking.customer?.documents?.license?.back?.url} target="_blank" rel="noreferrer" className="block w-full h-24 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary transition-colors">
                                  <img src={selectedBooking.documents?.license?.back?.url || selectedBooking.customer?.documents?.license?.back?.url} className="w-full h-full object-cover" alt="License Back" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedBooking.signature?.url && (
                      <div>
                        <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Digital Signature</p>
                        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant inline-block">
                          <img src={selectedBooking.signature.url} className="h-20 w-auto opacity-80" alt="Signature" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Vehicle Section */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-primary">directions_car</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider">Vehicle Details</h4>
                </div>
                <div className="flex gap-6">
                  <div className="w-32 h-24 bg-surface rounded-xl border border-outline-variant overflow-hidden flex-shrink-0">
                    {selectedBooking.car?.images?.[0]?.url ? (
                      <img src={selectedBooking.car.images[0].url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-bold">{selectedBooking.car?.make} {selectedBooking.car?.model}</h5>
                    <p className="text-secondary font-medium">Rental Period: {new Date(selectedBooking.startDate).toLocaleDateString()} to {new Date(selectedBooking.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </section>

              {/* Financial Section */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider">Payment Summary</h4>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-secondary">
                    <span>Rental Duration</span>
                    <span className="font-bold text-on-surface">{selectedBooking.totalDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-secondary">
                    <span>Payment Status</span>
                    <span className={`font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full ${selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="font-black text-2xl text-primary">₹{Number(selectedBooking.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <button 
                    onClick={() => generateInvoice(selectedBooking)}
                    className="w-full py-4 bg-dark text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download Invoice
                  </button>
                </div>
              </section>

              {/* Notes Section */}
              {(selectedBooking.notes || selectedBooking.promoCode) && (
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                    <span className="material-symbols-outlined text-primary">notes</span>
                    <h4 className="font-bold text-lg uppercase tracking-wider">Additional Info</h4>
                  </div>
                  {selectedBooking.notes && (
                    <div className="bg-surface-container-high/50 p-4 rounded-xl italic text-on-surface-variant mb-4">
                      "{selectedBooking.notes}"
                    </div>
                  )}
                  {selectedBooking.promoCode && (
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span className="material-symbols-outlined text-sm">sell</span>
                      <span>Promo Used: {selectedBooking.promoCode}</span>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="p-8 border-t border-outline-variant bg-surface-container-low flex gap-4">
              {nextStatus[selectedBooking.status] && (
                <button 
                  onClick={() => handleStatusChange(selectedBooking._id, nextStatus[selectedBooking.status])}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                  Mark {nextStatus[selectedBooking.status].toUpperCase()}
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="flex-1 py-4 bg-surface border border-outline-variant rounded-xl font-bold hover:bg-surface-tint transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
