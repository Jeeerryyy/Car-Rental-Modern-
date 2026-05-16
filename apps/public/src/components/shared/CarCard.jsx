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
    <div className={`rounded-[12px] overflow-hidden flex flex-col h-full ${car?.isBooked ? 'opacity-85' : ''}`}
      style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)', boxShadow: '0 1px 3px rgba(25,19,14,0.06)' }}
    >
      <div className="h-[220px] relative p-6 flex items-center justify-center overflow-hidden" style={{ background: 'rgba(213,201,180,0.3)' }}>
        <img src={image} alt={name} loading="lazy" width="360" height="200"
          className={`w-full h-full object-contain ${car?.isBooked ? 'blur-[3px] grayscale' : ''}`}
        />
        {car?.isBooked && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(220,207,186,0.1)', backdropFilter: 'blur(1px)' }}>
            <div className="px-6 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase transform -rotate-3"
              style={{ background: 'rgba(25,19,14,0.9)', color: '#F9F8F3', border: '1px solid rgba(220,207,186,0.2)' }}
            >Currently Booked</div>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#19130E' }}>{name}</h3>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-medium mb-4 uppercase tracking-wider" style={{ color: '#6b5e50' }}>
          <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: '#EBE6DE' }}>{car?.fuelType || car?.category || 'Sedan'}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.year || new Date().getFullYear()}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.location || 'Junagadh'}</span>
        </div>
        {totalReviews > 0 && (
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#8a7d6f' }}>{totalReviews} verified bookings</p>
        )}
        <div className="mt-auto pt-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
          <div>
            <span className="text-2xl font-bold" style={{ color: '#19130E' }}>₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-bold ml-1 uppercase tracking-tighter" style={{ color: '#6b5e50' }}>/ day</span>
          </div>
          <Link
            to={`/cars/${car?._id || id}`}
            className={`px-5 py-2.5 text-xs font-bold rounded-[8px] uppercase tracking-widest no-underline ${
              car?.isBooked ? 'cursor-not-allowed pointer-events-none' : ''
            }`}
            style={car?.isBooked
              ? { background: '#EBE6DE', color: '#6b5e50', border: '1px solid rgba(182,124,61,0.15)' }
              : { background: '#19130E', color: '#F9F8F3', border: '1px solid #19130E' }
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
