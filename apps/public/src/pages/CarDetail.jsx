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
        const [carRes, reviewsRes] = await Promise.all([
          carAPI.getById(id),
          reviewAPI.getByCar(id, { page: 1, limit: 5 })
        ]);
        setCar(carRes.data.data.car);
        setReviews(reviewsRes.data.data || []);
      } catch {
        setError('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-off pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted mb-8">
            <Link to="/" className="hover:text-dark transition-colors">Home</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link to="/cars" className="hover:text-dark transition-colors">Fleet</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-dark">Car Details</span>
          </nav>
          <div className="bg-white rounded-xl p-8 border border-border shadow-sm text-center">
            <h2 className="text-2xl font-display font-bold text-dark mb-4">Vehicle Not Available</h2>
            <p className="text-muted mb-8">The vehicle details are currently unavailable. Please browse our fleet.</p>
            <Link to="/cars" className="btn-primary px-10">Back to Fleet</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images.map(img => img.url) : ['/no-car.png'];

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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm">
              <div className="relative h-[400px] bg-gray-50 flex items-center justify-center p-8">
                <img src={images[selectedImage]} alt={`${car.make} ${car.model}`} className={`max-h-full max-w-full object-contain transition-all duration-700 ${car.isBooked ? 'blur-sm grayscale' : ''}`} />
                {car.isBooked && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                    <div className="bg-dark/95 text-white p-8 rounded-2xl shadow-2xl border border-white/10 max-w-sm transform -rotate-2">
                      <h3 className="text-2xl font-bold mb-2">On a Trip</h3>
                      <p className="text-sm text-gray-300 font-medium leading-relaxed">
                        This vehicle is currently rented and will be available for new bookings from 
                        <span className="block text-white text-lg mt-1 font-display">
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
                      className={`w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-dark' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
              <h2 className="text-xl font-bold text-dark mb-4">About This Vehicle</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{car.description}</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-off rounded-lg">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Category</p>
                  <p className="font-bold text-dark capitalize">{car.category}</p>
                </div>
                <div className="text-center p-4 bg-off rounded-lg">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Year</p>
                  <p className="font-bold text-dark">{car.year}</p>
                </div>
                <div className="text-center p-4 bg-off rounded-lg">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Rating</p>
                  <p className="font-bold text-dark">★ {Number(car.averageRating || 0).toFixed(1)}</p>
                </div>
                <div className="text-center p-4 bg-off rounded-lg">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold text-dark">{car.location}</p>
                </div>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
                <h2 className="text-xl font-bold text-dark mb-6">Customer Reviews</h2>
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {review.customer?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-dark">{review.customer?.name || 'Customer'}</p>
                          <p className="text-xs text-muted">★ {review.rating}/5</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
                <div className="mb-6">
                  <p className="text-3xl font-bold text-dark">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted font-medium">per day</p>
                </div>
                <CarBookingForm car={car} customer={customer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
