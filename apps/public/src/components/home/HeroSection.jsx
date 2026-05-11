import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-52 bg-gradient-to-br from-soft-white via-white to-light-gray overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center relative z-10">
        <div className="lg:w-1/2 max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl lg:text-[76px] leading-[1.05] font-extrabold text-text tracking-[-2px] mb-8 whitespace-pre-line">
            {'Drive Your Journey.\nYour Way.'}
          </h1>
          <p className="text-xl text-muted/90 mb-12 max-w-lg leading-relaxed font-medium">
            Junagadh's most trusted self drive car rental since 2017. Cars with & without driver. Airport pickup. Bike rentals.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            <Link to="/cars" className="btn-primary w-full sm:w-auto justify-center">Browse Fleet</Link>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {['bg-gray-300', 'bg-gray-400', 'bg-gray-500'].map((bg) => (
                  <div key={bg} className={`w-10 h-10 rounded-full border-2 border-[#f8f6f0] ${bg}`} />
                ))}
              </div>
              <div className="text-sm font-semibold text-dark ml-2">
                5.0★ <span className="font-normal text-muted block text-xs">500+ Fleet | 8+ Years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 relative mt-16 lg:mt-0">
          <img
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80"
            alt="Premium self drive rental car from Modern Selfdrive"
            fetchPriority="high"
            width="900" height="600"
            className="w-full h-auto drop-shadow-2xl z-10 relative object-contain"
          />
          <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-[var(--radius-md)] shadow-lg z-20">
            <p className="font-bold text-dark text-xl">5.0 ⭐</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">400+ Verified Reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
