import React from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../shared/CarCard';
import { ArrowRightIcon, CarIcon, CheckIcon, CopyIcon } from '../ui/Icons';

export default function PopularFleetSection({ loading, cars, promo, copied, handleCopyCode }) {
  return (
    <section className="py-24 max-w-[1320px] mx-auto px-6 lg:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted">Handpicked Selection</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-dark mb-4">Popular Fleet</h2>
          <p className="text-muted text-lg leading-relaxed">Our most requested vehicles for business and leisure. Every car is sanitized and maintained to the highest standards.</p>
        </div>
        <Link to="/cars" className="btn-outline group whitespace-nowrap">
          View All Fleet
          <ArrowRightIcon className="ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)
          : cars.length > 0
            ? cars.slice(0, 3).map((c) => (
              <CarCard key={c._id} id={c._id} car={c} />
            ))
            : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-off/50 rounded-[var(--radius-md)] border border-dashed border-border flex flex-col items-center justify-center">
                <CarIcon className="w-12 h-12 text-muted/20 mb-4" />
                <p className="text-muted mb-6 font-medium">Unable to load featured fleet right now.</p>
                <Link to="/cars" className="btn-outline !bg-white">Browse Full Fleet</Link>
              </div>
            )
        }

        <div className="bg-dark rounded-[var(--radius-lg)] p-10 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-xl h-full min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/95 to-dark/40 z-10" />
          <img
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
            alt="" loading="lazy" aria-hidden="true"
          />
          <div className="relative z-20 w-full flex flex-col items-center">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[2px] mb-6 inline-block border border-white/20">
              {promo?.title || 'Limited Offer'}
            </span>
            <h3 className="font-display text-3xl font-bold mb-4 leading-tight">
              Get <span className="text-accent text-4xl">
                {promo?.discountType === 'fixed' ? '₹' : ''}
                {promo?.discountValue || '20'}
                {promo?.discountType === 'percentage' || !promo ? '%' : ''}
              </span> Off<br />{promo?.description || 'Your First Booking'}
            </h3>

            <div className="flex flex-col items-center gap-2 mb-8 w-full">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Use Promo Code</p>
              <button
                onClick={handleCopyCode}
                className="relative w-full py-3 border border-dashed border-white/30 rounded-sm bg-white/5 font-mono text-white text-xl font-bold tracking-widest group/copy cursor-pointer hover:bg-white/10 transition-colors"
                title="Click to copy code"
              >
                {promo?.code || 'MODERN20'}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 group-hover/copy:opacity-100 transition-opacity">
                  {copied ? <CheckIcon className="w-4 h-4 text-accent" /> : <CopyIcon className="w-4 h-4 text-white/40" />}
                </span>
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dark text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    CODE COPIED!
                  </span>
                )}
              </button>
            </div>

            <Link to="/cars" className="btn-primary !bg-white !text-dark w-full justify-center shadow-lg">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-[var(--radius-md)] overflow-hidden shadow-sm border border-border">
      <div className="h-[220px] skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-8 skeleton w-1/3 mt-4" />
      </div>
    </div>
  );
}
