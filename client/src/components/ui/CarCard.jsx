import { memo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, XIcon } from './Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f4f3ee" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%23999" font-size="14" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

function CarCard({ id, image, name, transmission, seats, category, price, fuelType, driveOption }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (user && Array.isArray(user.wishlist)) {
      setIsWishlisted(user.wishlist.includes(id));
    }
  }, [user, id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    const prev = isWishlisted;
    setIsWishlisted(!prev);
    setWishlistLoading(true);

    try {
      if (prev) {
        await api.delete(`/api/wishlist/${id}`);
      } else {
        await api.post(`/api/wishlist/${id}`);
      }
      if (user) {
        const currentWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
        const newWishlist = prev 
          ? currentWishlist.filter(item => item !== id)
          : [...currentWishlist, id];
        user.wishlist = newWishlist;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      setIsWishlisted(prev);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    navigate('/auth', { state: { from: `/cars/${id}` } });
  };

  const specs = [transmission, `${seats} Seats`, category, fuelType].filter(Boolean);

  return (
    <>
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 text-center">
            <button onClick={() => setShowLoginPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <XIcon className="w-4 h-4 text-gray-400" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Save This Vehicle</h3>
            <p className="text-gray-500 mb-8">Sign in to save vehicles to your wishlist.</p>
            <div className="space-y-3">
              <button onClick={handleLoginClick} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Sign In to Continue
              </button>
              <button onClick={handleLoginClick} className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Create New Account
              </button>
            </div>
            <button onClick={() => setShowLoginPrompt(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
              Maybe later
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col h-full group">
        <div className="h-[220px] bg-gray-50 relative p-6 flex items-center justify-center overflow-hidden">
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            aria-label={`Save ${name} to wishlist`}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all z-10 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
          >
            <HeartIcon fill={isWishlisted ? 'currentColor' : 'none'} className={`w-[18px] h-[18px] ${wishlistLoading ? 'animate-pulse' : ''}`} />
          </button>
          <img src={image || FALLBACK_IMG} alt={name} loading="lazy" width="360" height="200" className="w-full h-full object-contain" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{name}</h3>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-500 mb-6">
            {specs.map((s, i) => (
              <span key={s}>
                {i > 0 && <span className="text-[8px] mr-2">•</span>}
                {s}
              </span>
            ))}
            {driveOption && (
              <>
                <span className="text-[8px]">•</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{driveOption}</span>
              </>
            )}
          </div>
          <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">₹{Number(price).toLocaleString('en-IN')}</span>
              <span className="text-xs text-gray-500 font-medium ml-1">/ day</span>
            </div>
            <Link to={`/cars/${id}`} className="px-5 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(CarCard);