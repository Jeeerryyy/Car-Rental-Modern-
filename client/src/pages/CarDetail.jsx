import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
import BookingFlow from '../components/booking/BookingFlow';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCar = async () => {
      try {
        const res = await api.get(`/api/cars/${id}`);
        setCar(res.data);
      } catch {
        // silent fail — !car state handled in render with not-found UI
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

  return (
    <div className="min-h-screen bg-off pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted mb-8">
          <Link to="/" className="hover:text-dark transition-colors">Home</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link to="/cars" className="hover:text-dark transition-colors">Fleet</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-dark">{car.make} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Visuals & Info */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Image Gallery */}
            <section className="bg-white rounded-[var(--radius-xl)] p-4 border border-border shadow-sm">
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-off relative group">
                <img 
                  src={car.images?.[activeImage] || 'https://via.placeholder.com/800x450'} 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  alt={car.model} 
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-dark/90 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                  {car.isPopular && <span className="bg-dark text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Popular Choice</span>}
                </div>
              </div>
              
              {car.images?.length > 1 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                  {car.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`relative w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === i ? 'border-accent shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Title & Stats */}
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

            {/* Quick Specs */}
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

            {/* Description */}
            <section>
              <h2 className="text-2xl font-display font-bold text-dark mb-6">About this Vehicle</h2>
              <p className="text-muted leading-relaxed mb-8">
                The {car.make} {car.model} offers an exceptional blend of performance, comfort, and state-of-the-art technology. 
                Perfect for both urban navigation and long-distance cruising, this vehicle is meticulously maintained by our 
                in-house technicians to ensure the highest standards of safety and reliability for your journey.
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

          {/* Right Column: Sticky Booking Sidebar */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white rounded-[var(--radius-xl)] border border-border p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CalendarIcon className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold text-dark mb-6">Reserve Now</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-off rounded-xl border border-border">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted mb-2">
                      <span>Rent Type</span>
                      <span className="text-accent">{car.driveOption}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-dark">{car.category} Series</p>
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Security Deposit</span>
                      <span className="font-bold">₹{Number(car.securityDeposit || 5000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Rental Charge</span>
                      <span className="font-bold">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">GST (Included)</span>
                      <span className="font-bold text-emerald-600">0%</span>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-between items-end">
                      <span className="text-dark font-bold">Total Estimate</span>
                      <span className="text-2xl font-display font-bold text-dark">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => isAuthenticated ? setShowBookingFlow(true) : navigate('/auth')}
                  className="w-full btn-primary !py-4 flex items-center justify-center gap-3 group shadow-lg shadow-dark/10"
                >
                  <span className="text-lg font-bold">Proceed to Booking</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-muted mt-6 font-bold uppercase tracking-widest leading-relaxed">
                  Instant confirmation • No hidden fees • Verified documents required
                </p>

                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Assistance Required?</p>
                  <div className="flex gap-4">
                    <a href="tel:+918792492717" className="flex-1 bg-off hover:bg-dark hover:text-white border border-border rounded-lg p-3 flex flex-col items-center gap-1 transition-all group">
                      <PhoneIcon className="w-4 h-4 text-muted group-hover:text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Call Hub</span>
                    </a>
                    <a href="https://wa.me/918792492717" className="flex-1 bg-off hover:bg-emerald-500 hover:text-white border border-border rounded-lg p-3 flex flex-col items-center gap-1 transition-all group">
                      <WhatsAppIcon className="w-4 h-4 text-muted group-hover:text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 px-4 text-muted">
              <ShieldCheckIcon className="w-8 h-8 opacity-40" />
              <p className="text-[11px] leading-snug font-medium italic">
                "Your safety is our priority. All Modern Selfdrive vehicles are GPS tracked and come with emergency assistance."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <BookingFlow 
          car={car} 
          onClose={() => setShowBookingFlow(false)} 
          onComplete={(booking) => {
            setShowBookingFlow(false);
            navigate('/profile', { state: { newBooking: booking } });
          }}
        />
      )}
    </div>
  );
};

export default CarDetail;
