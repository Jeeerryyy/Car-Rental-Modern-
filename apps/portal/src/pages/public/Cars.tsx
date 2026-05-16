import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as customerApi from '../../api/public/customerApi.js';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const result = (await customerApi.getAllCars(undefined)).data;
        const raw = result?.data;
        setCars(Array.isArray(raw) ? raw : (raw?.cars || []));
      } catch (err) {
        console.error('Failed to load cars', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="bg-surface min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="text-[11px] font-bold tracking-widest uppercase text-secondary mb-3">Our Fleet</div>
          <h1 className="font-headline-xl text-on-surface" style={{ fontSize: 'clamp(48px,6vw,80px)', lineHeight: 0.93, letterSpacing: '-0.01em' }}>
            Choose Your <span className="text-secondary">Ride</span>
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-outline rounded-[20px] overflow-hidden h-[460px] skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => {
              const images = car.images?.length > 0
                ? car.images.map(img => typeof img === 'string' ? img : img.url)
                : ['https://placehold.co/400x220/111/fff?text=No+Image'];
              return (
                <Link key={car._id} to={`/cars/${car._id}`}
                  className="bg-white border border-outline rounded-[20px] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:border-secondary/25 group">
                  <div className="relative h-[220px] bg-[#F3F4F6] overflow-hidden">
                    <img src={images[0]} alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 bg-secondary text-[#111] font-headline-lg text-[14px] px-2.5 py-0.5 z-10">
                      ₹{car.pricePerDay?.toLocaleString()}/day
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/40 text-white/70 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 z-10">
                      {car.category}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2.5 flex-1">
                    <div className="font-headline-xl text-on-surface leading-none" style={{ fontSize: '22px', letterSpacing: '0.02em' }}>
                      {car.make}<br />{car.model}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-[11px] text-on-surface-variant font-semibold flex items-center gap-1">
                        {car.fuelType || '—'}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-semibold flex items-center gap-1">
                        {car.transmission || '—'}
                      </span>
                      {car.seats && <span className="text-[11px] text-on-surface-variant font-semibold">{car.seats} Seats</span>}
                    </div>
                    <div className="mt-auto">
                      <div className="w-full py-2.5 bg-secondary text-[#111] font-bold text-[11px] uppercase tracking-widest text-center group-hover:bg-[#B08040] transition-colors">
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}