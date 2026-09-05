import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBookings, updateBookingStatus, uploadOwnerDocuments, deleteBooking, getInvoiceHTML } from '../api/bookings.js';
import WhatsAppBookingModal from '../components/common/WhatsAppBookingModal.jsx';
import toast from 'react-hot-toast';


const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'];

const CANCELLATION_REASONS = [
  { value: 'invalid_documents', label: 'Invalid Documents', icon: 'description_off' },
  { value: 'vehicle_not_available', label: 'Vehicle Not Available', icon: 'no_crash' },
  { value: 'customer_no_show', label: 'Customer No-Show', icon: 'person_off' },
  { value: 'payment_issue', label: 'Payment Issue', icon: 'money_off' },
  { value: 'other', label: 'Other', icon: 'more_horiz' },
];

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';

  const formatUTCDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [whatsAppModalBooking, setWhatsAppModalBooking] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, bookingName: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, bookingId: null, bookingName: '' });
  const [deleting, setDeleting] = useState(false);
  
  // Owner Verification state
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docPreviews, setDocPreviews] = useState([]);


  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filter !== 'all') params.status = filter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getBookings(params);
      setBookings(res.data.data || res.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter, page, debouncedSearch]);

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

  const openCancelModal = (bookingId, customerName) => {
    setCancelModal({ open: true, bookingId, bookingName: customerName || 'this booking' });
    setCancelReason('');
    setCancelNote('');
  };

  const handleCancel = async () => {
    if (!cancelReason) { toast.error('Please select a reason'); return; }
    setCancelling(true);
    try {
      await updateBookingStatus(cancelModal.bookingId, {
        status: 'cancelled',
        cancellationReason: cancelReason,
        cancellationNote: cancelReason === 'other' ? cancelNote : undefined,
      });
      toast.success('Booking cancelled');
      setCancelModal({ open: false, bookingId: null, bookingName: '' });
      fetchBookings();
      if (selectedBooking?._id === cancelModal.bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: 'cancelled', cancellationReason: cancelReason, cancellationNote: cancelNote, cancelledBy: 'owner' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const openDeleteModal = (bookingId, customerName) => {
    setDeleteModal({ open: true, bookingId, bookingName: customerName || 'this booking' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBooking(deleteModal.bookingId);
      toast.success('Booking deleted successfully');
      setDeleteModal({ open: false, bookingId: null, bookingName: '' });
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Show previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setDocPreviews(prev => [...prev, ...newPreviews]);

    setUploadingDocs(true);
    try {
      const base64Files = await Promise.all(
        files.map(file => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        }))
      );

      if (!selectedBooking?._id) return;
      const res = await uploadOwnerDocuments(selectedBooking._id, { documents: base64Files });
      toast.success('Documents uploaded successfully');
      
      const updatedBooking = res.data?.data?.booking || res.data?.booking;
      
      if (updatedBooking) {
        setSelectedBooking(updatedBooking);
      }
      
      setDocPreviews([]); // Clear previews after success
      fetchBookings(); // Refresh list to get updated data

    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setDocPreviews([]);
    } finally {
      setUploadingDocs(false);
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





  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-6 sm:gap-8 pb-24 md:pb-6 relative w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-1">Bookings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and track all customer & offline car bookings</p>
        </div>
        <Link
          to="/bookings/new"
          className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 bg-dark text-white font-bold text-sm rounded-xl hover:bg-black/90 transition-all shadow-md shadow-dark/10 active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Add Offline Booking</span>
        </Link>
      </div>

      {/* Modern Search Bar */}
      <div className="flex flex-col gap-3 w-full">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search bookings by customer name, phone number, car make/model, or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl text-sm font-semibold text-primary placeholder:text-on-surface-variant/60 outline-none focus:border-primary transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container transition-colors"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
            </button>
          )}
        </div>

        {debouncedSearch && (
          <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">manage_search</span>
              <span>
                Search results for: <strong className="text-primary font-bold">"{debouncedSearch}"</strong>
                {!loading && (
                  <span className="ml-1 text-on-surface-variant">
                    ({bookings.length} {bookings.length === 1 ? 'booking found' : 'bookings found'})
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full pb-2">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === s ? 'bg-dark text-white shadow-sm' : 'bg-surface hover:bg-surface-tint border border-outline-variant/50'}`}>
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
        <div className="grid grid-cols-1 gap-4 w-full max-w-full min-w-0">
          {bookings.filter(Boolean).map(b => (
            <div 
              key={b?._id || Math.random()} 
              onClick={() => setSelectedBooking(b)}
              className="p-4 sm:p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative overflow-hidden w-full max-w-full min-w-0"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0">
                <div className="flex-1 min-w-0 w-full overflow-hidden">
                  <div className="flex items-center justify-between lg:justify-start gap-3 mb-2 w-full min-w-0">
                    <p className="font-bold text-on-surface text-base sm:text-lg group-hover:text-primary transition-colors truncate min-w-0 flex-1 lg:flex-none">{b?.customer?.name || 'Customer'}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shrink-0 ${statusColors[b?.status] || 'bg-gray-100'}`}>{b?.status}</span>
                  </div>
                  <div className="flex flex-col gap-1 w-full min-w-0">
                    <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2 min-w-0 w-full overflow-hidden">
                      <span className="material-symbols-outlined text-[14px] shrink-0">mail</span>
                      <span className="truncate break-all min-w-0">{b?.customer?.email}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2 min-w-0 w-full overflow-hidden">
                      <span className="material-symbols-outlined text-[14px] shrink-0">call</span>
                      <span className="truncate min-w-0">{b?.phone || b?.customer?.phone || 'Not Provided'}</span>
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2 flex flex-wrap items-center gap-2 w-full min-w-0">
                      <span className="font-bold text-on-surface truncate min-w-0 max-w-full">{b?.car?.make} {b?.car?.model}</span>
                      <span className="opacity-50 shrink-0">·</span>
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
                        {b?.startDate ? formatUTCDate(b.startDate) : 'N/A'} – {b?.endDate ? formatUTCDate(b.endDate) : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-row sm:items-center justify-between sm:justify-end gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-0 border-outline-variant min-w-0">
                  <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full sm:w-auto min-w-0 shrink-0 gap-2">
                    <p className="font-black text-xl text-primary shrink-0">₹{Number(b?.totalPrice || 0).toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${b?.paymentStatus === 'paid' ? 'text-green-600' : b?.paymentStatus === 'pay_at_car' ? 'text-blue-600' : 'text-yellow-600'}`}>{b?.paymentStatus === 'pay_at_car' ? 'Pay at Car' : b?.paymentStatus}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end min-w-0">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalBooking(b);
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 shadow-sm cursor-pointer"
                      title="Send WhatsApp Reminder or Dispatch Notice"
                    >
                      <span className="text-base leading-none">💬</span>
                      <span>WhatsApp</span>
                    </button>
                    {nextStatus[b?.status] ? (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openCancelModal(b?._id, b?.customer?.name);
                          }}
                          className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all active:scale-95 text-center shrink-0"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(b?._id, nextStatus[b?.status]);
                          }}
                          className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-bold bg-dark text-white rounded-xl hover:bg-black/90 transition-all active:scale-95 shadow-lg shadow-dark/10 text-center shrink-0 capitalize"
                        >
                          {nextStatus[b?.status]}
                        </button>
                      </>
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-secondary self-end sm:self-auto shrink-0">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </div>
                    )}
                  </div>
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
          <div className="relative w-full md:max-w-xl lg:max-w-2xl bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300 max-w-full overflow-hidden">
            <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low sticky top-0 z-20 w-full">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl md:text-2xl font-bold text-primary truncate">Booking Details</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[selectedBooking.status] || 'bg-gray-100'}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <p className="text-secondary text-[10px] md:text-sm mt-1 truncate">ID: {selectedBooking?._id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 w-full min-w-0">
              {/* Customer Section */}
              <section className="w-full min-w-0">
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2 w-full min-w-0">
                  <span className="material-symbols-outlined text-primary shrink-0">person</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider truncate">Customer Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1 truncate">Name</p>
                    <p className="text-base sm:text-lg font-bold truncate">{selectedBooking.customer?.name}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1 truncate">Phone</p>
                    <p className="text-base sm:text-lg font-bold truncate">{selectedBooking.phone || selectedBooking.customer?.phone || 'Not Provided'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 min-w-0">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1 truncate">Email</p>
                    <p className="text-base sm:text-lg font-bold break-all">{selectedBooking.customer?.email}</p>
                  </div>
                </div>

                {/* Documents & Signature */}
                {(selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url || selectedBooking.signature?.url) && (
                  <div className="mt-8 space-y-8 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 truncate">Verification Documents</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
                        {(selectedBooking.documents?.aadhaar?.front?.url || selectedBooking.customer?.documents?.aadhaar?.front?.url) && (
                          <div className="space-y-2 w-full min-w-0">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">Aadhaar Card</p>
                            <div className="grid grid-cols-2 gap-2 w-full">
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
                          <div className="space-y-2 w-full min-w-0">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">Driving License</p>
                            <div className="grid grid-cols-2 gap-2 w-full">
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
                      <div className="w-full min-w-0">
                        <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 truncate">Digital Signature</p>
                        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant inline-block w-full sm:w-auto max-w-full overflow-x-auto">
                          <img src={selectedBooking.signature.url} className="h-20 w-auto opacity-80" alt="Signature" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Owner Verification Documents (Pickup) */}
                <div className="mt-10 pt-8 border-t border-outline-variant w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 w-full min-w-0">
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg text-primary flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined shrink-0">verified_user</span>
                        Pickup Verification
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate">Owner-uploaded documents for customer pickup</p>
                    </div>
                    {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'active') && (
                      <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        Upload Photos
                        <input type="file" multiple accept="image/*" onChange={handleDocUpload} className="hidden" disabled={uploadingDocs} />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-full min-w-0">
                    {/* Existing Owner Documents */}
                    {selectedBooking.ownerVerification?.documents?.map((doc, idx) => (
                      <div key={idx} className="relative aspect-square bg-surface rounded-xl border border-outline-variant overflow-hidden group min-w-0">

                        <img src={doc.url} className="w-full h-full object-cover" alt={`Verification ${idx + 1}`} />
                        <a href={doc.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">open_in_new</span>
                        </a>
                      </div>
                    ))}

                    {/* Previews (Uploading) */}
                    {uploadingDocs && docPreviews.map((url, idx) => (
                      <div key={`preview-${idx}`} className="relative aspect-square bg-surface rounded-xl border border-primary/50 overflow-hidden animate-pulse min-w-0">
                        <img src={url} className="w-full h-full object-cover opacity-50" alt="Uploading..." />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    ))}

                    {(!selectedBooking.ownerVerification?.documents || selectedBooking.ownerVerification.documents.length === 0) && !uploadingDocs && (

                      <div className="col-span-full py-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                        <span className="material-symbols-outlined text-outline text-4xl mb-2">no_photography</span>
                        <p className="text-sm text-on-surface-variant">No pickup documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>


              {/* Vehicle Section */}
              <section className="w-full min-w-0">
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2 w-full min-w-0">
                  <span className="material-symbols-outlined text-primary shrink-0">directions_car</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider truncate">Vehicle Details</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full min-w-0">
                  <div className="w-full sm:w-32 h-40 sm:h-24 bg-surface rounded-xl border border-outline-variant overflow-hidden flex-shrink-0 max-w-full">
                    {selectedBooking.car?.images?.[0]?.url ? (
                      <img src={selectedBooking.car.images[0].url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xl font-bold truncate">{selectedBooking.car?.make} {selectedBooking.car?.model}</h5>
                    <p className="text-secondary font-medium text-sm sm:text-base truncate">Rental Period: {formatUTCDate(selectedBooking.startDate)} to {formatUTCDate(selectedBooking.endDate)}</p>
                  </div>
                </div>
              </section>

              {/* Financial Section */}
              <section className="w-full min-w-0">
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-2 w-full min-w-0">
                  <span className="material-symbols-outlined text-primary shrink-0">payments</span>
                  <h4 className="font-bold text-lg uppercase tracking-wider truncate">Payment Summary</h4>
                </div>
                <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl space-y-4 w-full min-w-0">
                  <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                    <span className="truncate">Rental Duration</span>
                    <span className="font-bold text-on-surface shrink-0">{selectedBooking.totalDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                    <span className="truncate">Payment Status</span>
                    <span className={`font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shrink-0 ${
                      selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      selectedBooking.paymentStatus === 'pay_at_car' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedBooking.paymentStatus === 'pay_at_car' ? 'Pay at Car' : selectedBooking.paymentStatus}
                    </span>
                  </div>
                  {selectedBooking.promoCode && (
                    <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                      <span className="truncate">Promo Applied</span>
                      <span className="font-bold text-green-600 shrink-0">{selectedBooking.promoCode} ({selectedBooking.discountAmount > 0 ? `-₹${selectedBooking.discountAmount}` : ''})</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                    <span className="truncate">Security Deposit</span>
                    <span className="font-bold text-on-surface shrink-0">₹{Number(selectedBooking.securityDeposit || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                    <span className="truncate">Paid Amount</span>
                    <span className="font-bold text-on-surface shrink-0">₹{Number(selectedBooking.amountPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-secondary gap-2 min-w-0">
                    <span className="truncate">Remaining Amount</span>
                    <span className="font-bold text-primary shrink-0">₹{Number(Math.max(0, (selectedBooking.amountPaid || 0) >= (selectedBooking.securityDeposit || 0) ? (selectedBooking.totalPrice - (selectedBooking.amountPaid || 0)) : (selectedBooking.totalPrice + (selectedBooking.securityDeposit || 0) - (selectedBooking.amountPaid || 0)))).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center mb-4 gap-2 min-w-0">
                    <span className="font-bold text-lg truncate">Total Amount</span>
                    <span className="font-black text-2xl text-primary shrink-0">₹{Number(selectedBooking.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </section>

              {/* Notes Section */}
              {(selectedBooking.notes || selectedBooking.promoCode) && (
                <section className="w-full min-w-0">
                  <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-2 w-full min-w-0">
                    <span className="material-symbols-outlined text-primary shrink-0">notes</span>
                    <h4 className="font-bold text-lg uppercase tracking-wider truncate">Additional Info</h4>
                  </div>
                  {selectedBooking.notes && (
                    <div className="bg-surface-container-high/50 p-4 rounded-xl italic text-on-surface-variant mb-4 break-words w-full overflow-hidden">
                      "{selectedBooking.notes}"
                    </div>
                  )}
                  {selectedBooking.promoCode && (
                    <div className="flex items-center gap-2 text-primary font-bold w-full min-w-0">
                      <span className="material-symbols-outlined text-sm shrink-0">sell</span>
                      <span className="truncate">Promo Used: {selectedBooking.promoCode}</span>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="p-4 sm:p-6 pb-10 border-t border-outline-variant bg-surface-container-low flex flex-col gap-3 sm:gap-4 w-full">
              {/* WhatsApp Action Button */}
              <button
                type="button"
                onClick={() => setWhatsAppModalBooking(selectedBooking)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <span className="text-lg">💬</span>
                <span>Send WhatsApp Reminder & Dispatch Notice</span>
              </button>

              {/* Download Invoice Button */}
              {['confirmed', 'active', 'completed'].includes(selectedBooking?.status) && (
                <button
                  onClick={async () => {
                    if (!selectedBooking?._id) return;
                    try {
                      const res = await getInvoiceHTML(selectedBooking._id);
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
                  className="w-full py-3 bg-[#141414] text-white rounded-btn font-bold text-sm shadow-lg shadow-black/10 hover:bg-[#A56A43] transition-all active:scale-[0.98] flex items-center justify-center gap-2 px-4 text-center shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  Download Invoice {selectedBooking?.invoiceNumber ? `(${selectedBooking.invoiceNumber})` : ''}
                </button>
              )}
              {nextStatus[selectedBooking?.status] && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    onClick={() => openCancelModal(selectedBooking?._id, selectedBooking?.customer?.name)}
                    className="w-full sm:flex-1 py-3 bg-surface hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition-all active:scale-[0.98] text-center"
                  >
                    Cancel Booking
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedBooking?._id, nextStatus[selectedBooking?.status])}
                    className="w-full sm:flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-[0.98] text-center capitalize"
                  >
                    Mark as {nextStatus[selectedBooking?.status]}
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => openDeleteModal(selectedBooking?._id, selectedBooking?.customer?.name)}
                  className="w-full sm:flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                  Delete Booking
                </button>
                <button onClick={() => setSelectedBooking(null)} className="w-full sm:flex-1 py-3 bg-surface border border-outline-variant rounded-xl font-bold text-sm hover:bg-surface-tint transition-all active:scale-[0.98] text-center">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !cancelling && setCancelModal({ open: false, bookingId: null, bookingName: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500">cancel</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
                  <p className="text-sm text-gray-500">For {cancelModal.bookingName}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Select a reason for cancellation</p>
              <div className="grid grid-cols-1 gap-2">
                {CANCELLATION_REASONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setCancelReason(r.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                      cancelReason === r.value
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                    {r.label}
                    {cancelReason === r.value && (
                      <span className="material-symbols-outlined text-[18px] ml-auto text-red-500">check_circle</span>
                    )}
                  </button>
                ))}
              </div>

              {cancelReason === 'other' && (
                <textarea
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  placeholder="Provide additional details..."
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
                />
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, bookingId: null, bookingName: '' })}
                disabled={cancelling}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason || cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Booking Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal({ open: false, bookingId: null, bookingName: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500">delete</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Booking</h3>
                  <p className="text-sm text-gray-500">For {deleteModal.bookingName}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this booking? This action is permanent and cannot be undone. All booking information will be removed from the system.
              </p>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, bookingId: null, bookingName: '' })}
                disabled={deleting}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* WhatsApp Booking Dispatch & Notification Modal */}
      <WhatsAppBookingModal
        isOpen={!!whatsAppModalBooking}
        onClose={() => setWhatsAppModalBooking(null)}
        booking={whatsAppModalBooking}
      />
    </div>
  );
}
