import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import CarCard from '../shared/CarCard';
import { ArrowRightIcon, CarIcon, CheckIcon, CopyIcon } from '../ui/Icons';

export default function PopularFleetSection({ loading, cars, promo, copied, handleCopyCode }) {
  return (
    <section className="py-24 max-w-[1320px] mx-auto px-6 lg:px-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left"
      >
        <div className="max-w-2xl flex flex-col items-center md:items-start w-full">
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#5C5C5C' }}>Handpicked Selection</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#121212' }}>Popular Fleet</h2>
          <p className="text-lg leading-relaxed" style={{ color: '#5C5C5C' }}>Our most requested vehicles for business and leisure. Every car is sanitized and maintained to the highest standards.</p>
        </div>
        <Link to="/cars" className="animate-btn whitespace-nowrap md:self-end justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" className="shrink-0 transition-transform">
            <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
          </svg>
          <span>Browse Full Fleet</span>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: promo ? 3 : 4 }, (_, i) => <CardSkeleton key={i} />)
          : cars.length > 0
            ? cars.slice(0, promo ? 3 : 4).map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <CarCard id={c._id} car={c} />
              </motion.div>
            ))
            : (
              <div className={`col-span-1 md:col-span-2 ${promo ? 'lg:col-span-3' : 'lg:col-span-4'} text-center py-20 rounded-[8px] flex flex-col items-center justify-center`}
                style={{ background: 'rgba(214,208,199,0.5)', border: '1px dashed #D6D0C7' }}
              >
                <CarIcon className="w-12 h-12 mb-4" style={{ color: 'rgba(18,18,18,0.15)' }} />
                <p className="mb-6 font-medium" style={{ color: '#5C5C5C' }}>Unable to load featured fleet right now.</p>
                <Link to="/cars" className="animate-btn justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" className="shrink-0 transition-transform">
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                  </svg>
                  <span>Browse Full Fleet</span>
                </Link>
              </div>
            )
        }

        {promo && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-10 flex flex-col justify-center items-center text-center relative overflow-hidden h-full min-h-[400px]"
            style={{ background: '#121212', boxShadow: '0 1px 3px rgba(18,18,18,0.06)' }}
          >
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(135deg, #121212 0%, rgba(18,18,18,0.95) 50%, rgba(18,18,18,0.4) 100%)' }} />
            <img
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
              alt="" loading="lazy" aria-hidden="true"
            />
            <div className="relative z-20 w-full flex flex-col items-center">
              <span className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[2px] mb-6 inline-block"
                style={{ background: 'rgba(214,208,199,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(214,208,199,0.2)', color: '#F4F1EA' }}
              >
                {promo.title || 'Limited Offer'}
              </span>
              <h3 className="font-display text-3xl font-bold mb-4 leading-tight" style={{ color: '#F4F1EA' }}>
                Get <span className="text-4xl" style={{ color: '#A56A43' }}>
                  {promo.discountType === 'fixed' ? '₹' : ''}
                  {promo.discountValue || '20'}
                  {promo.discountType === 'percentage' || !promo ? '%' : ''}
                </span> Off<br />{promo.description || 'Your First Booking'}
              </h3>

              <div className="flex flex-col items-center gap-2 mb-8 w-full">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8B8B8B' }}>Use Promo Code</p>
                <button
                  onClick={handleCopyCode}
                  className="relative w-full py-3 rounded-sm font-mono text-xl font-bold tracking-widest cursor-pointer"
                  style={{ border: '1px dashed rgba(214,208,199,0.3)', background: 'rgba(214,208,199,0.05)', color: '#F4F1EA' }}
                  title="Click to copy code"
                >
                  {promo.code}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60">
                    {copied ? <CheckIcon className="w-4 h-4" style={{ color: '#A56A43' }} /> : <CopyIcon className="w-4 h-4" style={{ color: 'rgba(214,208,199,0.4)' }} />}
                  </span>
                  {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap"
                      style={{ background: '#F4F1EA', color: '#121212', boxShadow: '0 1px 3px rgba(18,18,18,0.06)' }}
                    >
                      CODE COPIED!
                    </span>
                  )}
                </button>
              </div>

              <Link to="/cars" className="btn-primary w-full justify-center" style={{ background: '#F4F1EA', color: '#121212', border: '1px solid #F4F1EA' }}>
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-[12px] overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', boxShadow: '0 1px 3px rgba(18,18,18,0.06)' }}>
      <div className="h-[220px] skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-8 skeleton w-1/3 mt-4" />
      </div>
    </div>
  );
}
