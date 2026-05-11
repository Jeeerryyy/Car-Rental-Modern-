import React from 'react';
import { MapIcon } from '../ui/Icons';

export default function DestinationItinerary({ itinerary }) {
  return (
    <section>
      <h2 className="text-3xl font-display font-bold text-dark mb-8 flex items-center gap-3">
        <MapIcon className="text-accent w-10 h-10" />
        Curated Itinerary
      </h2>
      <div className="space-y-6">
        {itinerary.map((day, idx) => (
          <div key={day.day} className="flex gap-6 relative">
            {idx !== itinerary.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px bg-border -z-10" />}
            <div className="w-12 h-12 flex-shrink-0 bg-dark text-white rounded-full flex items-center justify-center font-bold font-display shadow-md border-4 border-off">
              {idx + 1}
            </div>
            <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm flex-1">
              <h3 className="text-lg font-bold text-dark mb-1">{day.day}: {day.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{day.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
