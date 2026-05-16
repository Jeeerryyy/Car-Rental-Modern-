import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, updateBookingStatus, uploadOwnerDocuments } from '../api/bookings.js';
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, bookingName: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Owner Verification state
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docPreviews, setDocPreviews] = useState([]);


  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter !== 'all') params.status = filter;
      const res = await getBookings(params);
      setBookings(res.data.data || res.data || []);
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
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Bookings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage all your car rental bookings</p>
        </div>

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
                    <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      {b.phone || b.customer?.phone || 'Not Provided'}
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
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${b.paymentStatus === 'paid' ? 'text-green-600' : b.paymentStatus === 'pay_at_car' ? 'text-blue-600' : 'text-yellow-600'}`}>{b.paymentStatus === 'pay_at_car' ? 'Pay at Car' : b.paymentStatus}</p>
                  </div>
                  {nextStatus[b.status] ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openCancelModal(b._id, b.customer?.name);
                        }}
                        className="px-4 py-3 text-sm font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(b._id, nextStatus[b.status]);
                        }}
                        className="px-6 py-3 text-sm font-bold bg-dark text-white rounded-xl hover:bg-black/90 transition-all active:scale-95 shadow-lg shadow-dark/10"
                      >
                        {nextStatus[b.status]}
                      </button>
                    </div>
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
                    <p className="text-lg font-bold">{selectedBooking.phone || selectedBooking.customer?.phone || 'Not Provided'}</p>
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

                {/* Owner Verification Documents (Pickup) */}
                <div className="mt-10 pt-8 border-t border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">verified_user</span>
                        Pickup Verification
                      </h4>
                      <p className="text-xs text-on-surface-variant">Owner-uploaded documents for customer pickup</p>
                    </div>
                    {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'active') && (
                      <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        Upload Photos
                        <input type="file" multiple accept="image/*" onChange={handleDocUpload} className="hidden" disabled={uploadingDocs} />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {/* Existing Owner Documents */}
                    {selectedBooking.ownerVerification?.documents?.map((doc, idx) => (
                      <div key={idx} className="relative aspect-square bg-surface rounded-xl border border-outline-variant overflow-hidden group">

                        <img src={doc.url} className="w-full h-full object-cover" alt={`Verification ${idx + 1}`} />
                        <a href={doc.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">open_in_new</span>
                        </a>
                      </div>
                    ))}

                    {/* Previews (Uploading) */}
                    {uploadingDocs && docPreviews.map((url, idx) => (
                      <div key={`preview-${idx}`} className="relative aspect-square bg-surface rounded-xl border border-primary/50 overflow-hidden animate-pulse">
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
                    <span className={`font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full ${
                      selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      selectedBooking.paymentStatus === 'pay_at_car' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedBooking.paymentStatus === 'pay_at_car' ? 'Pay at Car' : selectedBooking.paymentStatus}
                    </span>
                  </div>
                  {selectedBooking.promoCode && (
                    <div className="flex justify-between items-center text-secondary">
                      <span>Promo Applied</span>
                      <span className="font-bold text-green-600">{selectedBooking.promoCode} ({selectedBooking.discountAmount > 0 ? `-₹${selectedBooking.discountAmount}` : ''})</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="font-black text-2xl text-primary">₹{Number(selectedBooking.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                  

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
                <>
                  <button 
                    onClick={() => openCancelModal(selectedBooking._id, selectedBooking.customer?.name)}
                    className="py-4 px-6 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedBooking._id, nextStatus[selectedBooking.status])}
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                  >
                    Mark {nextStatus[selectedBooking.status].toUpperCase()}
                  </button>
                </>
              )}
              <button onClick={() => setSelectedBooking(null)} className="flex-1 py-4 bg-surface border border-outline-variant rounded-xl font-bold hover:bg-surface-tint transition-all">
                Close
              </button>
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
    </div>
  );
}
