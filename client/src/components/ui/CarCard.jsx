import { memo } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f4f3ee" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%23999" font-size="14" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

function CarCard({ id, image, name, transmission, seats, category, price, fuelType, driveOption }) {
  const specs = [transmission, `${seats} Seats`, category, fuelType].filter(Boolean);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col h-full group">
      <div className="h-[220px] bg-gray-50 relative p-6 flex items-center justify-center overflow-hidden">
        <img src={image || FALLBACK_IMG} alt={name} loading="lazy" width="360" height="200" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
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
  );
}

export default memo(CarCard);