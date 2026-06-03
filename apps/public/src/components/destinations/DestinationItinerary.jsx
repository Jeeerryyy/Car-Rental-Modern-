import React from 'react';
import { MapIcon } from '../ui/Icons';

export default function DestinationItinerary({ itinerary }) {
  return (
    <section>
      <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3" style={{ color: '#121212' }}>
        <MapIcon className="w-10 h-10" style={{ color: '#A56A43' }} />
        Curated Itinerary
      </h2>
      <div className="space-y-6">
        {itinerary.map((day, idx) => (
          <div key={day.day} className="flex gap-6 relative">
            {idx !== itinerary.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px -z-10" style={{ background: '#D6D0C7' }} />}
            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold font-display" style={{ background: '#121212', color: '#F4F1EA', border: '4px solid #F4F1EA' }}>
              {idx + 1}
            </div>
            <div className="p-6 rounded-[12px] flex-1" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <h3 className="text-lg font-bold mb-1" style={{ color: '#121212' }}>{day.day}: {day.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5C5C5C' }}>{day.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
