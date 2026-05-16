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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F8F3' }}>
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(25,19,14,0.15)', borderTopColor: '#19130E' }}></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen pt-24 pb-20" style={{ background: '#F9F8F3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#6b5e50' }}>
            <Link to="/" className="no-underline" style={{ color: '#6b5e50' }}>Home</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link to="/cars" className="no-underline" style={{ color: '#6b5e50' }}>Fleet</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span style={{ color: '#19130E' }}>Car Details</span>
          </nav>
          <div className="rounded-[12px] p-8 text-center" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
            <h2 className="text-2xl font-display font-bold mb-4" style={{ color: '#19130E' }}>Vehicle Not Available</h2>
            <p className="mb-8" style={{ color: '#6b5e50' }}>The vehicle details are currently unavailable. Please browse our fleet.</p>
            <Link to="/cars" className="btn-primary px-10">Back to Fleet</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images.map(img => img.url) : ['/no-car.png'];

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#F9F8F3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#6b5e50' }}>
          <Link to="/" className="no-underline" style={{ color: '#6b5e50' }}>Home</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link to="/cars" className="no-underline" style={{ color: '#6b5e50' }}>Fleet</Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span style={{ color: '#19130E' }}>{car.make} {car.model}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[12px] overflow-hidden" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <div className="relative h-[400px] flex items-center justify-center p-8" style={{ background: 'rgba(213,201,180,0.3)' }}>
                <img src={images[selectedImage]} alt={`${car.make} ${car.model}`} loading="lazy" className={`max-h-full max-w-full object-contain ${car.isBooked ? 'blur-sm grayscale' : ''}`} />
                {car.isBooked && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center" style={{ background: 'rgba(220,207,186,0.2)', backdropFilter: 'blur(2px)' }}>
                    <div className="p-8 rounded-[12px] max-w-sm transform -rotate-2" style={{ background: 'rgba(25,19,14,0.95)', border: '1px solid rgba(220,207,186,0.1)' }}>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>On a Trip</h3>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(220,207,186,0.5)' }}>
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
                      style={{ border: selectedImage === i ? '2px solid #19130E' : '2px solid transparent' }}>
                      <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[12px] p-8" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#19130E' }}>About This Vehicle</h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: '#6b5e50' }}>{car.description}</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[{ label: 'Category', value: car.category }, { label: 'Year', value: car.year }, { label: 'Location', value: car.location }].map(item => (
                  <div key={item.label} className="text-center p-4 rounded-[8px]" style={{ background: '#EBE6DE' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6b5e50' }}>{item.label}</p>
                    <p className="font-bold capitalize" style={{ color: '#19130E' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="rounded-[12px] p-8" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#19130E' }}>Customer Reviews</h2>
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="pb-6 last:border-0" style={{ borderBottom: '1px solid rgba(182,124,61,0.15)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#19130E', color: '#FFFFFF' }}>
                          {review.customer?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: '#19130E' }}>{review.customer?.name || 'Customer'}</p>
                          <p className="text-xs" style={{ color: '#6b5e50' }}>★ {review.rating}/5</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#6b5e50' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24"><CarBookingForm car={car} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
