import { memo } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f4f3ee" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%23999" font-size="14" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

function CarCard({ id, image, name, transmission, seats, category, price, fuelType, driveOption }) {
  const specs = [transmission, `${seats} Seats`, category, fuelType].filter(Boolean);

  return (
    <div className="bg-white rounded-[var(--radius-md)] overflow-hidden shadow-sm border border-border group flex flex-col h-full">
      <div className="h-[220px] bg-off relative p-6 flex items-center justify-center">
        <button
          aria-label={`Save ${name} to wishlist`}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-muted hover:text-red-500 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
        </button>
        <img
          src={image || FALLBACK_IMG}
          alt={name}
          loading="lazy"
          width="360"
          height="200"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-xl font-bold text-dark mb-3">{name}</h3>

        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-muted mb-6">
          {specs.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="text-[8px] mr-2">•</span>}
              {s}
            </span>
          ))}
          {driveOption && (
            <>
              <span className="text-[8px]">•</span>
              <span className="bg-dark/5 px-2 py-0.5 rounded text-dark font-medium">{driveOption}</span>
            </>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-dark">₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-xs text-muted font-medium ml-1">/ day</span>
          </div>
          <Link to={`/cars/${id}`} className="btn-outline !py-2 !px-5 !text-[13px]">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(CarCard);
