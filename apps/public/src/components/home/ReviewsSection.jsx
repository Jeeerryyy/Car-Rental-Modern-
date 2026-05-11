import React from 'react';
import { QuoteIcon, CarIcon, RouteIcon } from '../ui/Icons';

export default function ReviewsSection({ reviews, reviewsLoading }) {
  return (
    <section className="py-24 bg-off overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 mb-12">
        <h2 className="font-display text-4xl font-bold text-dark mb-4 text-center">What Our Clients Say</h2>
        <p className="text-muted text-center max-w-xl mx-auto">Real reviews from our valued customers across Junagadh and Saurashtra region.</p>
      </div>
      
      <div className="relative w-full overflow-hidden">
        {reviewsLoading ? (
          <div className="flex gap-6 justify-center px-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="w-[350px] flex-shrink-0">
                <ReviewSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 w-max animate-marquee">
            {[0, 1].flatMap((set) =>
              reviews.map((r, i) => (
                <a href="https://g.page/modern-selfdrive" target="_blank" rel="noopener noreferrer" key={`${set}-${r._id || i}`} className="w-[350px] flex-shrink-0 block group cursor-pointer">
                  <ReviewCard review={r} />
                </a>
              ))
            )}
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
    <div className="bg-white p-8 rounded-[var(--radius-md)] border border-border shadow-sm relative flex flex-col h-[280px]">
      <QuoteIcon className="text-yellow-400 w-12 h-12 absolute top-6 right-6 opacity-20" />
      <div className="flex text-yellow-400 mb-4 text-lg tracking-wide">{stars}</div>
      <p className="text-muted italic mb-6 leading-relaxed flex-1 overflow-hidden text-ellipsis line-clamp-5">"{text}"</p>
      {(vehicle || tripType) && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {vehicle && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <CarIcon className="w-3.5 h-3.5" />
              {vehicle}
            </span>
          )}
          {tripType && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <RouteIcon className="w-3.5 h-3.5" />
              {tripType}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white p-8 rounded-[var(--radius-md)] border border-border shadow-sm h-[280px] flex flex-col">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="w-5 h-5 skeleton rounded" />)}
      </div>
      <div className="space-y-2 mb-6 flex-1">
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-5/6" />
        <div className="h-4 skeleton w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 skeleton w-24 rounded-full" />
        <div className="h-6 skeleton w-20 rounded-full" />
      </div>
    </div>
  );
}
