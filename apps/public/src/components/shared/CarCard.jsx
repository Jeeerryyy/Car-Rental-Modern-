import { memo } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23d5c9b4" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%236b5e50" font-size="14" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

function CarCard({ id, car }) {
  const name = car ? `${car.make} ${car.model}` : 'Unknown Car';
  const image = car?.images?.[0]?.url || FALLBACK_IMG;
  const price = car?.pricePerDay || 0;
  const rating = car?.averageRating || car?.rating?.average || 0;
  const totalReviews = car?.rating?.count || car?.totalBookings || 0;

  return (
    <div className={`rounded-card overflow-hidden flex flex-col h-full hover:bg-[#EFE8DD] transition-colors duration-200 ${car?.isBooked ? 'opacity-85' : ''}`}
      style={{ background: '#F8F6F1', border: '1px solid #D6D0C7', boxShadow: '0 1px 3px rgba(18,18,18,0.04)' }}
    >
      <div className="h-[220px] relative overflow-hidden" style={{ background: 'rgba(214,208,199,0.15)' }}>
        <img src={image} alt={name} loading="lazy" width="360" height="200"
          className={`w-full h-full object-cover ${car?.isBooked ? 'blur-[3px] grayscale' : ''}`}
        />
        {car?.isBooked && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(2px)' }}>
            <div className="px-6 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase transform -rotate-3"
              style={{ background: '#141414', color: '#F8F6F1', border: '1px solid rgba(214,208,199,0.2)' }}
            >Currently Booked</div>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
        <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#121212' }}>{name}</h3>
        <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-2 gap-y-1 text-xs font-medium mb-4 uppercase tracking-wider" style={{ color: '#5C5C5C' }}>
          <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: '#E7E0D4' }}>{car?.fuelType || car?.category || 'Sedan'}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.year || new Date().getFullYear()}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.location || 'Junagadh'}</span>
        </div>
        {totalReviews > 0 && (
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#8B8B8B' }}>{totalReviews} verified bookings</p>
        )}
        <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full" style={{ borderTop: '1px solid #D6D0C7' }}>
          <div>
            <span className="text-2xl font-bold" style={{ color: '#121212' }}>₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-bold ml-1 uppercase tracking-tighter" style={{ color: '#5C5C5C' }}>/ day</span>
          </div>
          <Link
            to={`/cars/${car?._id || id}`}
            className={`inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-btn uppercase tracking-widest no-underline ${
              car?.isBooked ? 'cursor-not-allowed pointer-events-none' : ''
            }`}
            style={car?.isBooked
              ? { background: '#E7E0D4', color: '#5C5C5C', border: '1px solid #D6D0C7' }
              : { background: '#141414', color: '#F8F6F1', border: '1px solid #141414' }
            }
          >
            {car?.isBooked ? 'Unavailable' : 'Book Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(CarCard);
