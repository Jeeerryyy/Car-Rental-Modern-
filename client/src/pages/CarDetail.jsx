import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    pickupDate: '',
    dropoffDate: '',
    pickupLocation: 'Junagadh City',
    dropoffLocation: 'Junagadh City',
    paymentMethod: 'UPI',
    driverRequired: false
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/api/cars/${id}`);
        setCar(res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const days = formData.pickupDate && formData.dropoffDate
    ? Math.max(1, Math.ceil((new Date(formData.dropoffDate) - new Date(formData.pickupDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const driverCharge = formData.driverRequired ? days * 500 : 0;
  const totalPrice = car ? (days * car.pricePerDay) + driverCharge : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (new Date(formData.pickupDate) < new Date().setHours(0, 0, 0, 0)) {
      setError('Pickup date cannot be in the past');
      return;
    }
    if (new Date(formData.dropoffDate) <= new Date(formData.pickupDate)) {
      setError('Drop-off date must be after pickup date');
      return;
    }

    setBooking(true);
    try {
      const res = await api.post('/api/bookings', {
        carId: id,
        ...formData
      });
      setSuccess(res.data.confirmationNumber);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">error</span>
          <h2 className="font-display text-2xl font-bold text-dark mb-2">Vehicle Not Found</h2>
          <p className="text-muted mb-6">This vehicle may have been removed from our fleet.</p>
          <Link to="/cars" className="btn-primary inline-flex">Back to Fleet</Link>
        </div>
      </div>
    );
  }

  const locations = ['Junagadh City', 'Junagadh Airport (IATA: JGA)', 'Keshod Airport', 'Somnath', 'Gir', 'Veraval', 'Porbandar', 'Rajkot'];

  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link to="/" className="hover:text-dark transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/cars" className="hover:text-dark transition-colors">Cars</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-dark">{car.make} {car.model}</span>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-[var(--radius-md)] p-8 text-center mb-8">
            <span className="material-symbols-outlined text-green-600 text-5xl mb-3 block">check_circle</span>
            <h2 className="font-display text-2xl font-bold text-dark mb-2">Booking Confirmed!</h2>
            <p className="text-muted mb-1">Your confirmation number is:</p>
            <p className="font-mono text-2xl font-bold text-dark bg-white px-4 py-2 rounded-md inline-block border border-green-200 mt-2 mb-4">{success}</p>
            <p className="text-sm text-muted mb-6">A confirmation has been sent. You can view your booking in your profile.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/profile" className="btn-primary">View My Bookings</Link>
              <Link to="/cars" className="btn-outline">Browse More</Link>
            </div>
          </div>
        )}

        {!success && (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left: Car Info */}
            <div className="flex-1">
              {/* Main Image */}
              <div className="bg-white rounded-[var(--radius-lg)] p-8 border border-border shadow-sm mb-6">
                <div className="relative bg-off rounded-[var(--radius-md)] p-8 flex items-center justify-center h-[400px]">
                  <img
                    src={car.images?.[0] || 'https://via.placeholder.com/600x400?text=Car'}
                    alt={`${car.make} ${car.model}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${car.status === 'Available' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                    {car.status}
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="bg-white rounded-[var(--radius-md)] p-8 border border-border shadow-sm mb-6">
                <h2 className="font-display text-2xl font-bold text-dark mb-6">Vehicle Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-off rounded-[var(--radius-sm)] border border-border">
                    <span className="material-symbols-outlined text-muted text-[28px] mb-2">settings</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Transmission</span>
                    <span className="font-bold text-dark">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-off rounded-[var(--radius-sm)] border border-border">
                    <span className="material-symbols-outlined text-muted text-[28px] mb-2">event_seat</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Seats</span>
                    <span className="font-bold text-dark">{car.seats}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-off rounded-[var(--radius-sm)] border border-border">
                    <span className="material-symbols-outlined text-muted text-[28px] mb-2">local_gas_station</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Fuel</span>
                    <span className="font-bold text-dark">{car.fuelType}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-off rounded-[var(--radius-sm)] border border-border">
                    <span className="material-symbols-outlined text-muted text-[28px] mb-2">calendar_today</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Year</span>
                    <span className="font-bold text-dark">{car.year}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div className="bg-white rounded-[var(--radius-md)] p-8 border border-border shadow-sm mb-6">
                  <h2 className="font-display text-xl font-bold text-dark mb-4">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((f, i) => (
                      <span key={i} className="bg-off text-dark px-3 py-1.5 rounded-md text-sm font-semibold border border-border flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Drive Option & Deposit */}
              <div className="bg-white rounded-[var(--radius-md)] p-8 border border-border shadow-sm">
                <h2 className="font-display text-xl font-bold text-dark mb-4">Rental Information</h2>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted font-medium">Category</span>
                    <span className="font-bold text-dark">{car.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted font-medium">Drive Option</span>
                    <span className="font-bold text-dark">{car.driveOption}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted font-medium">License Plate</span>
                    <span className="font-mono font-bold text-dark">{car.licensePlate}</span>
                  </div>
                  {car.securityDeposit > 0 && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted font-medium">Security Deposit</span>
                      <span className="font-bold text-dark">₹{Number(car.securityDeposit).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-muted font-medium">Daily Rate</span>
                    <span className="font-bold text-dark text-lg">₹{Number(car.pricePerDay).toLocaleString('en-IN')}/day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white rounded-[var(--radius-lg)] border border-border shadow-sm sticky top-[100px]">
                <div className="p-8 border-b border-border">
                  <h2 className="font-display text-xl font-bold text-dark mb-1">{car.make} {car.model}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-dark">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-muted font-medium">/ day</span>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="p-8 flex flex-col gap-5">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Pick-up Location</label>
                    <select
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium bg-white"
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      required
                    >
                      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Drop-off Location</label>
                    <select
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium bg-white"
                      value={formData.dropoffLocation}
                      onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                      required
                    >
                      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Pick-up Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                        value={formData.pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Drop-off Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                        value={formData.dropoffDate}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Payment Method</label>
                    <select
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium bg-white"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="NetBanking">Net Banking</option>
                      <option value="Cash">Cash on Pickup</option>
                    </select>
                  </div>

                  {(car.driveOption === 'With Driver' || car.driveOption === 'Both') && (
                    <label className="flex items-center gap-3 cursor-pointer bg-off p-4 rounded-md border border-border">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-dark"
                        checked={formData.driverRequired}
                        onChange={(e) => setFormData({ ...formData, driverRequired: e.target.checked })}
                      />
                      <div>
                        <span className="text-sm font-bold text-dark block">Add Driver</span>
                        <span className="text-xs text-muted">₹500 extra per day</span>
                      </div>
                    </label>
                  )}

                  {/* Price Summary */}
                  {days > 0 && (
                    <div className="bg-off p-4 rounded-md border border-border">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">₹{Number(car.pricePerDay).toLocaleString('en-IN')} × {days} day{days > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-dark">₹{Number(days * car.pricePerDay).toLocaleString('en-IN')}</span>
                      </div>
                      {driverCharge > 0 && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted">Driver charge</span>
                          <span className="font-semibold text-dark">₹{Number(driverCharge).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {car.securityDeposit > 0 && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted">Security deposit (refundable)</span>
                          <span className="font-semibold text-dark">₹{Number(car.securityDeposit).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-dark pt-2 border-t border-border mt-2">
                        <span>Total</span>
                        <span className="text-lg">₹{Number(totalPrice).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={booking || car.status !== 'Available'}
                    className="bg-dark text-white font-semibold text-[15px] px-8 py-3.5 rounded-md hover:bg-dark-2 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Processing...' : car.status !== 'Available' ? 'Currently Unavailable' : 'Confirm Booking'}
                  </button>

                  <p className="text-xs text-muted text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Secure booking · Free cancellation before pickup
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetail;
