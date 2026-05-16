import React from 'react';
import { QuoteIcon, CarIcon, RouteIcon } from '../ui/Icons';

export default function ReviewsSection({ reviews, reviewsLoading }) {
  return (
    <section className="py-24 overflow-hidden" style={{ background: '#EBE6DE' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 mb-12">
        <h2 className="font-display text-4xl font-bold mb-4 text-center" style={{ color: '#19130E' }}>What Our Clients Say</h2>
        <p className="text-center max-w-xl mx-auto" style={{ color: '#6b5e50' }}>Real reviews from our valued customers across Junagadh and Saurashtra region.</p>
      </div>
      <div className="relative w-full overflow-hidden">
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
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  const { rating, text, vehicle, tripType } = review;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return (
    <div className="p-8 rounded-[12px] relative flex flex-col h-[280px]" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
      <QuoteIcon className="w-12 h-12 absolute top-6 right-6 opacity-20" style={{ color: '#B67C3D' }} />
      <div className="flex mb-4 text-lg tracking-wide" style={{ color: '#B67C3D' }}>{stars}</div>
      <p className="italic mb-6 leading-relaxed flex-1 overflow-hidden text-ellipsis line-clamp-5" style={{ color: '#6b5e50' }}>"{text}"</p>
      {(vehicle || tripType) && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {vehicle && (<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#EBE6DE', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}><CarIcon className="w-3.5 h-3.5" />{vehicle}</span>)}
          {tripType && (<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#EBE6DE', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}><RouteIcon className="w-3.5 h-3.5" />{tripType}</span>)}
        </div>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="p-8 rounded-[12px] h-[280px] flex flex-col" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
      <div className="flex gap-1 mb-4">{Array.from({ length: 5 }, (_, i) => <div key={i} className="w-5 h-5 skeleton rounded" />)}</div>
      <div className="space-y-2 mb-6 flex-1"><div className="h-4 skeleton w-full" /><div className="h-4 skeleton w-5/6" /><div className="h-4 skeleton w-3/4" /></div>
      <div className="flex gap-2"><div className="h-6 skeleton w-24 rounded-full" /><div className="h-6 skeleton w-20 rounded-full" /></div>
    </div>
  );
}
