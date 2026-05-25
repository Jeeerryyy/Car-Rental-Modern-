import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as customerApi from '../../api/public/customerApi.js';

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const result = (await customerApi.getFeaturedCars()).data;
        const raw = result?.data;
        setCars(Array.isArray(raw) ? raw : (raw?.cars || []));
      } catch {
        try {
          const result = (await customerApi.getAllCars({ limit: 6 })).data;
          const raw = result?.data;
          setCars(Array.isArray(raw) ? raw : (raw?.cars || []));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="bg-surface min-h-screen pt-16">
      {/* Hero */}
      <section className="min-h-[100dvh] flex items-center pb-20 relative overflow-hidden">
        <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 font-headline-xl text-[transparent]"
          style={{ fontSize: 'clamp(200px,28vw,420px)', WebkitTextStroke: '1px rgba(200,155,91,0.05)' }}>
          MODERN
        </div>
        <div className="absolute right-[16%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(200,155,91,0.12) 30%, rgba(200,155,91,0.12) 70%, transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-[720px]">
            <div className="text-[11px] font-bold tracking-widest uppercase text-secondary mb-7 flex items-center gap-2.5 opacity-0 animate-in fade-in duration-500" style={{ animationDelay: '0.1s' }}>
              <div className="w-7 h-px bg-secondary" />
              Self-Drive Car Rental
            </div>
            <h1 className="font-headline-xl text-on-surface leading-none mb-4 opacity-0 animate-in fade-in duration-500" style={{ fontSize: 'clamp(86px,12vw,160px)', animationDelay: '0.2s' }}>
              Drive<br /><span className="text-secondary">Your Way</span>
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-[460px] mb-10 opacity-0 animate-in fade-in duration-500" style={{ animationDelay: '0.35s' }}>
              Premium self-drive vehicles available 24/7. Freedom to explore at your own pace — no driver, no itinerary, no limits.
            </p>
            <div className="flex gap-3 flex-wrap opacity-0 animate-in fade-in duration-500" style={{ animationDelay: '0.45s' }}>
              <Link to="/cars" className="bg-secondary text-[#111] font-bold text-[13px] uppercase tracking-widest px-6 py-3.5 hover:bg-[#B08040] transition-colors no-underline">
                Browse Fleet
              </Link>
              <Link to="/login" className="border border-outline/20 text-on-surface text-[13px] font-bold uppercase tracking-widest px-6 py-3.5 hover:border-white/20 hover:text-white transition-all no-underline">
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex gap-0 mt-14 opacity-0 animate-in fade-in duration-500" style={{ animationDelay: '0.55s' }}>
            {[
              { value: '50+', label: 'Vehicles' },
              { value: '24/7', label: 'Support' },
              { value: '4.8', label: 'Rating' },
            ].map((stat, i) => (
              <div key={stat.label} className={`px-7 py-4 border border-outline border-r-0 bg-white ${i === 2 ? 'border-r' : ''}`}>
                <div className="font-headline-xl text-on-surface" style={{ fontSize: '36px' }}>{stat.value}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-14 flex-wrap gap-5">
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-secondary mb-5">Featured</div>
              <h2 className="font-headline-xl text-on-surface" style={{ fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}>
                Our <span className="text-secondary">Fleet</span>
              </h2>
            </div>
            <Link to="/cars" className="text-secondary font-bold text-[13px] uppercase tracking-widest no-underline hover:text-[#B08040] transition-colors">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-outline rounded-[20px] h-[460px] skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.slice(0, 6).map(car => {
                const images = car.images?.length > 0
                  ? car.images.map(img => typeof img === 'string' ? img : img.url)
                  : ['https://placehold.co/400x220/111/fff?text=No+Image'];
                return (
                  <Link key={car._id} to={`/cars/${car._id}`}
                    className="bg-surface border border-outline rounded-[20px] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:border-secondary/25 group">
                    <div className="relative h-[220px] overflow-hidden">
                      <img src={images[0]} alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2.5 right-2.5 bg-secondary text-[#111] font-headline-lg text-[14px] px-2.5 py-0.5 z-10">
                        ₹{car.pricePerDay?.toLocaleString()}/day
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="font-headline-xl text-on-surface leading-none" style={{ fontSize: '22px', letterSpacing: '0.02em' }}>
                        {car.make}<br />{car.model}
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-semibold">{car.year} · {car.category}</div>
                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-center w-full py-2.5 bg-secondary text-[#111] font-bold text-[11px] uppercase tracking-widest group-hover:bg-[#B08040] transition-colors">
                          Book Now
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#111827] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-headline-xl text-white" style={{ fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.9 }}>
              Ready to<br /><span className="text-secondary">Hit the Road?</span>
            </h2>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/cars" className="bg-secondary text-[#111] font-bold text-[13px] uppercase tracking-widest px-8 py-4 hover:bg-[#B08040] transition-colors no-underline">
              Browse Cars
            </Link>
            <Link to="/login" className="border border-white/20 text-white text-[13px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-white/5 transition-colors no-underline">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline py-8 bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <div className="font-headline-xl text-on-surface" style={{ fontSize: '22px', letterSpacing: '0.04em' }}>
            modern <span className="text-secondary">self drive</span>
          </div>
          <div className="text-[11px] text-on-surface-variant font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} modern self drive. Self-drive car rental.
          </div>
        </div>
      </footer>
    </div>
  );
}