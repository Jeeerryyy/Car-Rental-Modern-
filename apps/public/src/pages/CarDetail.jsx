import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronRightIcon } from '../components/ui/Icons';
import CarBookingForm from '../components/cars/CarBookingForm';

function CarDetail() {
  const { id } = useParams();
  const { customer } = useAuth();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carRes, reviewsRes] = await Promise.all([carAPI.getById(id), reviewAPI.getByCar(id, { page: 1, limit: 5 })]);
        setCar(carRes.data.data.car);
        setReviews(reviewsRes.data.data || []);
      } catch { setError('Failed to load car details'); }
      finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F1EA' }}>
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,18,0.15)', borderTopColor: '#121212' }}></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen pt-24 pb-20" style={{ background: '#F4F1EA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#5C5C5C' }}>
            <Link to="/" className="no-underline" style={{ color: '#5C5C5C' }}>Home</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link to="/cars" className="no-underline" style={{ color: '#5C5C5C' }}>Fleet</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span style={{ color: '#121212' }}>Car Details</span>
          </nav>
          <div className="rounded-[12px] p-8 text-center" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
            <h2 className="text-2xl font-display font-bold mb-4" style={{ color: '#121212' }}>Vehicle Not Available</h2>
            <p className="mb-8" style={{ color: '#5C5C5C' }}>The vehicle details are currently unavailable. Please browse our fleet.</p>
            <Link to="/cars" className="btn-primary px-10">Back to Fleet</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images.map(img => img.url) : ['/no-car.png'];

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#F4F1EA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#5C5C5C' }}>
          <Link to="/" className="no-underline" style={{ color: '#5C5C5C' }}>Home</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link to="/cars" className="no-underline" style={{ color: '#5C5C5C' }}>Fleet</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span style={{ color: '#121212' }}>{car.make} {car.model}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[12px] overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <div className="relative h-[400px] flex items-center justify-center p-8" style={{ background: 'rgba(213,201,180,0.3)' }}>
                <img src={images[selectedImage]} alt={`${car.make} ${car.model}`} loading="lazy" className={`max-h-full max-w-full object-contain ${car.isBooked ? 'blur-sm grayscale' : ''}`} />
                {car.isBooked && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center" style={{ background: 'rgba(214,208,199,0.2)', backdropFilter: 'blur(2px)' }}>
                    <div className="p-8 rounded-[12px] max-w-sm transform -rotate-2" style={{ background: 'rgba(18,18,18,0.95)', border: '1px solid rgba(214,208,199,0.1)' }}>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>On a Trip</h3>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(214,208,199,0.5)' }}>
                        This vehicle is currently rented and will be available from
                        <span className="block text-lg mt-1 font-display" style={{ color: '#FFFFFF' }}>
                          {new Date(new Date(car.bookedUntil).getTime() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className="w-20 h-16 flex-shrink-0 rounded-[8px] overflow-hidden"
                      style={{ border: selectedImage === i ? '2px solid #121212' : '2px solid transparent' }}>
                      <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[12px] p-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#121212' }}>About This Vehicle</h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: '#5C5C5C' }}>{car.description}</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Category', value: car.category },
                  { label: 'Year', value: car.year },
                  { label: 'Location', value: car.location },
                  car.fuelType && { label: 'Fuel Type', value: car.fuelType },
                  car.type !== 'bike' && car.transmission && { label: 'Transmission', value: car.transmission },
                  car.color && { label: 'Color', value: car.color }
                ].filter(Boolean).map(item => (
                  <div key={item.label} className="text-center p-4 rounded-[8px]" style={{ background: '#E7E0D4' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#5C5C5C' }}>{item.label}</p>
                    <p className="font-bold capitalize" style={{ color: '#121212' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="rounded-[12px] p-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#121212' }}>Customer Reviews</h2>
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="pb-6 last:border-0" style={{ borderBottom: '1px solid #D6D0C7' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#121212', color: '#FFFFFF' }}>
                          {review.customer?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: '#121212' }}>{review.customer?.name || 'Customer'}</p>
                          <p className="text-xs" style={{ color: '#5C5C5C' }}>★ {review.rating}/5</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#5C5C5C' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {customer ? (
                <CarBookingForm car={car} />
              ) : (
                <div className="rounded-2xl sm:rounded-[2rem] p-8 text-center" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
                  <h3 className="text-xl font-display font-bold mb-4" style={{ color: '#121212' }}>Book This Vehicle</h3>
                  <p className="mb-8 text-sm leading-relaxed" style={{ color: '#5C5C5C' }}>Please sign in or create an account to view booking options and reserve this vehicle.</p>
                  <div className="flex flex-col gap-4">
                    <Link to="/signin" className="w-full text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:opacity-90" style={{ background: '#121212', color: '#FFFFFF' }}>Sign In</Link>
                    <Link to="/signup" className="w-full text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:bg-[rgba(18,18,18,0.05)]" style={{ border: '2px solid #121212', color: '#121212' }}>Create Account</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
