import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronRightIcon, 
  CheckCircleIcon, 
  SettingsIcon, 
  UsersIcon, 
  FuelIcon, 
  CalendarIcon,
  ErrorIcon,
  LockIcon,
  ShieldCheckIcon,
  PhoneIcon,
  WhatsAppIcon,
  ArrowRightIcon,
  StarIcon,
  TransmissionIcon
} from '../components/ui/Icons';

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCar = async () => {
      try {
        const res = await api.get(`/api/cars/${id}`);
        setCar(res.data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center p-4">
        <div className="bg-white rounded-[var(--radius-xl)] p-12 text-center max-w-md shadow-sm border border-border">
          <ErrorIcon className="w-16 h-16 text-muted/20 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-dark mb-4">Vehicle Not Found</h2>
          <p className="text-muted mb-8">The vehicle you are looking for might have been retired or the link is incorrect.</p>
          <Link to="/cars" className="btn-primary px-10">Back to Fleet</Link>
        </div>
      </div>
    );
  }

  const features = [
    { label: 'Verified Vehicle', icon: ShieldCheckIcon, desc: 'Passed 150+ point quality check' },
    { label: 'Insurance Included', icon: LockIcon, desc: 'Zero depreciation insurance coverage' },
    { label: '24/7 Roadside', icon: PhoneIcon, desc: 'Instant support anywhere, anytime' },
    { label: 'Sanitized Car', icon: CheckCircleIcon, desc: 'Deep cleaned before every delivery' }
  ];

  const handleBookNow = async () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Please select start and end dates');
      return;
    }

    setIsBooking(true);
    try {
      const res = await api.post('/bookings', {
        carId: car._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        notes: bookingData.notes
      });
      
      if (res.success) {
        alert('Booking created successfully! Redirecting to payment...');
        // Here we would integrate Razorpay using res.data.razorpayOrder
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-off pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted mb-8">
          <Link to="/" className="hover:text-dark transition-colors">Home</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link to="/cars" className="hover:text-dark transition-colors">Fleet</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-dark">{car.make} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white rounded-[var(--radius-xl)] p-4 border border-border shadow-sm">
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-off relative group">
                <img 
                  src={car.images?.[activeImage] || 'https://via.placeholder.com/800x450'} 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  alt={car.model} 
                />
              </div>
            </section>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-dark mb-4">{car.make} {car.model}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1,2,3,4,5].map(s => <StarIcon key={s} className="w-4 h-4 fill-current" />)}
                    <span className="text-muted text-sm font-bold ml-2">(4.9/5)</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted px-3 py-1 bg-off rounded-full border border-border">{car.year} Model</span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted font-bold uppercase tracking-widest mb-1">Standard Daily Rate</p>
                <p className="text-4xl font-display font-bold text-dark">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Transmission', value: car.transmission, icon: TransmissionIcon },
                { label: 'Capacity', value: `${car.seats} Seats`, icon: UsersIcon },
                { label: 'Fuel Type', value: car.fuelType, icon: FuelIcon },
                { label: 'Kilometers', value: 'Unlimited', icon: SettingsIcon }
              ].map(spec => (
                <div key={spec.label} className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-dark transition-all">
                  <spec.icon className="w-6 h-6 text-muted mb-4 group-hover:text-dark transition-colors" />
                  <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">{spec.label}</p>
                  <p className="text-sm font-bold text-dark">{spec.value}</p>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-2xl font-display font-bold text-dark mb-6">About this Vehicle</h2>
              <p className="text-muted leading-relaxed mb-8">
                The {car.make} {car.model} offers an exceptional blend of performance, comfort, and state-of-the-art technology. 
                Perfect for both urban navigation and long-distance cruising, this vehicle is meticulously maintained.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-off border border-border flex items-center justify-center shrink-0">
                      <f.icon className="w-6 h-6 text-dark" />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark text-sm">{f.label}</h4>
                      <p className="text-xs text-muted mt-1">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white rounded-[var(--radius-xl)] border border-border p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold text-dark mb-6">Inquiry & Booking</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Start Date</label>
                      <input 
                        type="date" 
                        value={bookingData.startDate}
                        onChange={e => setBookingData({...bookingData, startDate: e.target.value})}
                        className="w-full bg-off border border-border rounded-lg px-4 py-3 font-bold text-dark focus:border-dark outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">End Date</label>
                      <input 
                        type="date" 
                        value={bookingData.endDate}
                        onChange={e => setBookingData({...bookingData, endDate: e.target.value})}
                        className="w-full bg-off border border-border rounded-lg px-4 py-3 font-bold text-dark focus:border-dark outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Notes (Optional)</label>
                      <textarea 
                        value={bookingData.notes}
                        onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                        className="w-full bg-off border border-border rounded-lg px-4 py-3 font-bold text-dark focus:border-dark outline-none transition-colors resize-none"
                        rows="2"
                        placeholder="Any special requests?"
                      ></textarea>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-end">
                    <span className="text-dark font-bold">Daily Estimate</span>
                    <span className="text-2xl font-display font-bold text-dark">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBookNow}
                  disabled={isBooking}
                  className="w-full btn-primary !py-4 flex items-center justify-center gap-3 group shadow-lg shadow-dark/10 disabled:opacity-50"
                >
                  <LockIcon className="w-5 h-5" />
                  <span className="text-lg font-bold">{isBooking ? 'Processing...' : 'Proceed to Checkout'}</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-muted mt-6 font-bold uppercase tracking-widest leading-relaxed">
                  Fast confirmation • No hidden fees • Premium service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
