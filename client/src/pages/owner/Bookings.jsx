import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  PlusIcon, CalendarIcon, FileIcon, CheckCircleIcon, 
  XCircleIcon, ClockIcon, FilterIcon, SearchIcon, DownloadIcon,
  UserIcon, CarIcon, XIcon, PhoneIcon, MailIcon, LocationIcon,
  ShieldIcon, PriceIcon, CameraIcon
} from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';
import socket from '../../services/socket';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cars, setCars] = useState([]);
  
  const [manualBooking, setManualBooking] = useState({
    carId: '', manualName: '', manualPhone: '', startDate: '', endDate: '', totalAmount: '', pickupLocation: '', dropLocation: ''
  });

  useEffect(() => {
    fetchData();

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('booking-created', handleUpdate);
    socket.on('booking-updated', handleUpdate);
    socket.on('booking-cancelled', handleUpdate);
    socket.on('booking-completed', handleUpdate);

    return () => {
      socket.off('booking-created', handleUpdate);
      socket.off('booking-updated', handleUpdate);
      socket.off('booking-cancelled', handleUpdate);
      socket.off('booking-completed', handleUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookRes, carsRes] = await Promise.all([
        api.get('/api/admin/bookings'),
        api.get('/api/admin/cars')
      ]);
      const bookData = bookRes.data?.data || (Array.isArray(bookRes.data) ? bookRes.data : []);
      setBookings(bookData);
      setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
    } catch (err) {
      toast.error('Failed to synchronize booking data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    try {
      const headers = ["Confirmation #", "Customer", "Vehicle", "Pickup", "Dropoff", "Amount", "Status", "Source"];
      const csv = [
        headers.join(','),
        ...filteredBookings.map(b => [
          `"${b.confirmationNumber || (b._id?.toString().slice(-6).toUpperCase())}"`,
          `"${b.userId?.name || b.manualName || 'Unknown'}"`,
          `"${b.carId?.make ? b.carId.make + ' ' + b.carId.model : 'N/A'}"`,
          `"${b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'}"`,
          `"${b.dropoffDate ? new Date(b.dropoffDate).toLocaleDateString() : 'N/A'}"`,
          b.totalPrice || 0,
          `"${b.status}"`,
          `"${b.source || 'online'}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ModernDrive_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  const handleManualBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/bookings/manual', manualBooking);
      toast.success('Offline booking recorded');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record booking');
    }
  };

  const filteredBookings = Array.isArray(bookings) ? bookings.filter(b => {
    const term = search.toLowerCase();
    const name = (b.userId?.name || b.manualName || '').toLowerCase();
    const conf = (b.confirmationNumber || '').toLowerCase();
    const matchesSearch = name.includes(term) || conf.includes(term);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accessing Booking Vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Booking Management</h1>
          <p className="text-sm text-gray-500">Comprehensive overview of all online and offline reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportData} className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <DownloadIcon className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <PlusIcon className="w-4 h-4" /> Add Offline Booking
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by customer name or confirmation reference..." 
            className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-gray-100 hidden md:block mx-2" />
          <FilterIcon className="w-4 h-4 text-gray-400" />
          <select 
            className="text-sm font-bold text-gray-600 border-none outline-none bg-transparent cursor-pointer" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-left">Ref / Created</th>
                <th className="px-6 py-5 text-left">Customer</th>
                <th className="px-6 py-5 text-left">Vehicle Details</th>
                <th className="px-6 py-5 text-left">Rental Period</th>
                <th className="px-6 py-5 text-left">Total</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedBooking(b)}>
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs font-bold text-gray-700 block">#{b.confirmationNumber || (b._id?.toString().slice(-6).toUpperCase())}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(b.createdAt)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{b.userId?.name || b.manualName || 'Customer'}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${b.source === 'offline' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'} uppercase tracking-tighter`}>
                            {b.source || 'Online'}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{b.userId?.email || b.manualPhone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CarIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{b.carId?.make ? `${b.carId.make} ${b.carId.model}` : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">{formatDate(b.pickupDate)}</p>
                      <p className="text-gray-400 font-medium">to {formatDate(b.dropoffDate)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-gray-900">{formatCurrency(b.totalPrice)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      b.status === 'Active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                      b.status === 'Completed' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 
                      b.status === 'Cancelled' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {b.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-0 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
            {/* Left Panel: Overview */}
            <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-8 flex flex-col gap-8 overflow-y-auto">
              <div className="flex justify-between items-start md:block">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Reservation</span>
                  <h2 className="text-2xl font-black text-gray-900 mt-1">#{selectedBooking.confirmationNumber || 'BOOKING'}</h2>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="md:hidden p-2 bg-white border border-gray-200 rounded-lg shadow-sm"><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><UserIcon className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                    <p className="font-bold text-gray-900">{selectedBooking.userId?.name || selectedBooking.manualName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <PhoneIcon className="w-4 h-4" /> {selectedBooking.userId?.phone || selectedBooking.manualPhone}
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <MailIcon className="w-4 h-4" /> {selectedBooking.userId?.email || 'Offline Booking'}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bill</span>
                  <span className="text-xl font-black text-blue-600">{formatCurrency(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                    selectedBooking.status === 'Active' ? 'bg-blue-600 text-white' : 
                    selectedBooking.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                  } uppercase tracking-widest`}>{selectedBooking.status}</span>
                </div>
              </div>

              <div className="mt-auto hidden md:block">
                <button onClick={() => setSelectedBooking(null)} className="w-full py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-900 hover:bg-white transition-all shadow-sm uppercase tracking-widest">Close Record</button>
              </div>
            </div>

            {/* Right Panel: Scrollable Content */}
            <div className="flex-1 p-8 overflow-y-auto space-y-10 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Booking Details
                </h3>
                <button onClick={() => setSelectedBooking(null)} className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"><XIcon className="w-6 h-6 text-gray-300" /></button>
              </div>

              {/* Grid sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Vehicle Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><CarIcon className="w-3 h-3" /> Vehicle Inventory</h4>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex gap-4">
                    <img 
                      src={selectedBooking.carId?.images?.[0] || 'https://via.placeholder.com/100x100?text=Car'} 
                      className="w-20 h-20 object-cover rounded-xl shadow-sm border border-white" 
                      alt="Car"
                    />
                    <div>
                      <p className="font-black text-gray-900">{selectedBooking.carId?.make} {selectedBooking.carId?.model}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block">{selectedBooking.carId?.licensePlate || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{selectedBooking.carId?.category} / {selectedBooking.carId?.transmission}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><LocationIcon className="w-3 h-3" /> Trip Logistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                        <p className="text-xs font-bold text-gray-900">{formatDate(selectedBooking.pickupDate)} • {selectedBooking.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dropoff</p>
                        <p className="text-xs font-bold text-gray-900">{formatDate(selectedBooking.dropoffDate)} • {selectedBooking.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Security */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><PriceIcon className="w-3 h-3" /> Financial Flow</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Base Rental</p>
                      <p className="text-sm font-black text-gray-900">{formatCurrency(selectedBooking.totalPrice)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Deposit</p>
                      <p className="text-sm font-black text-gray-900">{formatCurrency(selectedBooking.securityDeposit || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><ShieldIcon className="w-3 h-3" /> Security Verification</h4>
                  <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><CheckCircleIcon className="w-4 h-4" /></div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Identity Checked</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </div>

              {/* Documents & KYC */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><FileIcon className="w-3 h-3" /> Document & KYC Vault</h4>
                {selectedBooking.documents && selectedBooking.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedBooking.documents.map((doc, idx) => (
                      <div key={idx} className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{doc.type}</p>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                            <DownloadIcon className="w-3 h-3" /> OPEN VAULT
                          </a>
                        </div>
                        <div className="aspect-[16/9] bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                          <img src={doc.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={doc.type} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center">
                    <ShieldIcon className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No digital documents uploaded for this session.</p>
                  </div>
                )}
              </div>

              {/* Photos Log */}
              {(selectedBooking.preRidePhotos?.length > 0 || selectedBooking.postRidePhotos?.length > 0) && (
                <div className="space-y-6 pt-10 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><CameraIcon className="w-3 h-3" /> Condition Log</h4>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...(selectedBooking.preRidePhotos || []), ...(selectedBooking.postRidePhotos || [])].map((img, i) => (
                      <img key={i} src={img} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm" alt="Condition" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Modal (Keep existing) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manual Entry</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Record Offline Sale</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleManualBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" placeholder="Full Name" value={manualBooking.manualName} onChange={e => setManualBooking({...manualBooking, manualName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" placeholder="Contact #" value={manualBooking.manualPhone} onChange={e => setManualBooking({...manualBooking, manualPhone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Vehicle</label>
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none bg-white" value={manualBooking.carId} onChange={e => setManualBooking({...manualBooking, carId: e.target.value})}>
                  <option value="">Choose from fleet...</option>
                  {cars.map(car => (
                    <option key={car._id} value={car._id}>{car.make} {car.model} — {car.licensePlate}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup Date</label>
                  <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={manualBooking.startDate} onChange={e => setManualBooking({...manualBooking, startDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dropoff Date</label>
                  <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={manualBooking.endDate} onChange={e => setManualBooking({...manualBooking, endDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount (₹)</label>
                <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-blue-600" placeholder="0.00" value={manualBooking.totalAmount} onChange={e => setManualBooking({...manualBooking, totalAmount: e.target.value})} />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Record Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;