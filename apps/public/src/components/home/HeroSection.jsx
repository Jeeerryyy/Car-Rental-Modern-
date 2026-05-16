import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-52 overflow-hidden"
      style={{ background: '#F9F8F3' }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(182,124,61,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(182,124,61,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center relative z-10">
        <div className="max-w-3xl flex flex-col items-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-[76px] leading-[1.05] font-extrabold tracking-[-2px] mb-8 whitespace-pre-line"
            style={{ color: '#19130E' }}
          >
            {'Drive Your Journey.\nYour Way.'}
          </h1>
          <p className="text-xl mb-12 max-w-lg leading-relaxed font-medium" style={{ color: '#6b5e50' }}>
            Junagadh's most trusted self drive car rental since 2017. Cars with & without driver. Airport pickup. Bike rentals.
          </p>
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <Link to="/cars" className="btn-primary w-full sm:w-auto justify-center">Browse Fleet</Link>
            <div className="flex items-center gap-2 text-left">
              <div className="text-sm font-semibold ml-2" style={{ color: '#19130E' }}>
                5.0★ <span className="font-normal block text-xs" style={{ color: '#6b5e50' }}>500+ Fleet | 8+ Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
