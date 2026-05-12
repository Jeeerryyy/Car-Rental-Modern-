import { memo } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f4f3ee" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%23999" font-size="14" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

function CarCard({ id, car }) {
  const name = car ? `${car.make} ${car.model}` : 'Unknown Car';
  const image = car?.images?.[0]?.url || FALLBACK_IMG;
  const price = car?.pricePerDay || 0;
  const rating = car?.averageRating || car?.rating?.average || 0;
  const totalReviews = car?.rating?.count || car?.totalBookings || 0;

  return (
    <div className={`bg-white rounded-card overflow-hidden shadow-sm border border-border flex flex-col h-full group transition-all duration-500 hover:border-accent hover:shadow-lg ${car?.isBooked ? 'opacity-85' : ''}`}>
      <div className="h-[220px] bg-light-gray/30 relative p-6 flex items-center justify-center overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          loading="lazy" 
          width="360" 
          height="200" 
          className={`w-full h-full object-contain transition-all duration-700 ${car?.isBooked ? 'blur-[3px] grayscale' : ''}`} 
        />
        {car?.isBooked && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-dark/90 text-white px-6 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase shadow-2xl transform -rotate-3 border border-white/20">
              Currently Booked
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-text mb-2 tracking-tight group-hover:text-accent transition-colors">{name}</h3>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-muted mb-4 uppercase tracking-wider">
          <span className="bg-light-gray px-2 py-0.5 rounded text-[10px]">{car?.fuelType || car?.category || 'Sedan'}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.year || new Date().getFullYear()}</span>
          <span className="text-[8px]">•</span>
          <span>{car?.location || 'Junagadh'}</span>
        </div>
        {totalReviews > 0 && (
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-4">{totalReviews} verified bookings</p>
        )}
        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-accent">₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-muted font-bold ml-1 uppercase tracking-tighter">/ day</span>
          </div>
          <Link 
            to={`/cars/${car?._id || id}`} 
            className={`px-5 py-2.5 text-xs font-bold rounded-btn transition-all uppercase tracking-widest ${
              car?.isBooked 
                ? 'bg-light-gray text-muted border border-border cursor-not-allowed pointer-events-none' 
                : 'bg-accent text-dark border border-accent hover:brightness-110 shadow-sm'
            }`}
          >
            {car?.isBooked ? 'Unavailable' : 'Book Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(CarCard);
