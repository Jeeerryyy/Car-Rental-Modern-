import React from 'react';
import { motion } from 'motion/react';
import { QuoteIcon, CarIcon, RouteIcon } from '../ui/Icons';

export default function ReviewsSection({ reviews, reviewsLoading }) {
  return (
    <section className="py-24 overflow-hidden" style={{ background: '#E7E0D4' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1320px] mx-auto px-6 lg:px-10 mb-12"
      >
        <h2 className="font-display text-4xl font-bold mb-4 text-center" style={{ color: '#121212' }}>What Our Clients Say</h2>
        <p className="text-center max-w-xl mx-auto" style={{ color: '#5C5C5C' }}>Real reviews from our valued customers across Junagadh and Saurashtra region.</p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative w-full overflow-hidden"
      >
        {reviewsLoading ? (
          <div className="flex gap-6 justify-center px-6">
            {Array.from({ length: 3 }, (_, i) => (<div key={i} className="w-[350px] flex-shrink-0"><ReviewSkeleton /></div>))}
          </div>
        ) : (
          <div className="flex gap-6 w-max animate-marquee">
            {[0, 1].flatMap((set) => reviews.map((r, i) => (
              <a href="https://g.page/modern-selfdrive" target="_blank" rel="noopener noreferrer" key={`${set}-${r._id || i}`} className="w-[350px] flex-shrink-0 block cursor-pointer no-underline">
                <ReviewCard review={r} />
              </a>
            )))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function ReviewCard({ review }) {
  const { rating, text, vehicle, tripType } = review;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return (
    <div className="p-8 rounded-card relative flex flex-col h-[280px]" style={{ background: '#F8F6F1', border: '1px solid #D6D0C7' }}>
      <QuoteIcon className="w-12 h-12 absolute top-6 right-6 opacity-20" style={{ color: '#A56A43' }} />
      <div className="flex mb-4 text-lg tracking-wide" style={{ color: '#A56A43' }}>{stars}</div>
      <p className="italic mb-6 leading-relaxed flex-1 overflow-hidden text-ellipsis line-clamp-5" style={{ color: '#5C5C5C' }}>"{text}"</p>
      {(vehicle || tripType) && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {vehicle && (<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' }}><CarIcon className="w-3.5 h-3.5" />{vehicle}</span>)}
          {tripType && (<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' }}><RouteIcon className="w-3.5 h-3.5" />{tripType}</span>)}
        </div>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="p-8 rounded-card h-[280px] flex flex-col" style={{ background: '#F8F6F1', border: '1px solid #D6D0C7' }}>
      <div className="flex gap-1 mb-4">{Array.from({ length: 5 }, (_, i) => <div key={i} className="w-5 h-5 skeleton rounded" />)}</div>
      <div className="space-y-2 mb-6 flex-1"><div className="h-4 skeleton w-full" /><div className="h-4 skeleton w-5/6" /><div className="h-4 skeleton w-3/4" /></div>
      <div className="flex gap-2"><div className="h-6 skeleton w-24 rounded-full" /><div className="h-6 skeleton w-20 rounded-full" /></div>
    </div>
  );
}
