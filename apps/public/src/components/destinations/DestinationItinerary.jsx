import React from 'react';
import { MapIcon } from '../ui/Icons';

export default function DestinationItinerary({ itinerary }) {
  return (
    <section>
      <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3" style={{ color: '#19130E' }}>
        <MapIcon className="w-10 h-10" style={{ color: '#B67C3D' }} />
        Curated Itinerary
      </h2>
      <div className="space-y-6">
        {itinerary.map((day, idx) => (
          <div key={day.day} className="flex gap-6 relative">
            {idx !== itinerary.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px -z-10" style={{ background: 'rgba(182,124,61,0.15)' }} />}
            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold font-display" style={{ background: '#19130E', color: '#F9F8F3', border: '4px solid #F9F8F3' }}>
              {idx + 1}
            </div>
            <div className="p-6 rounded-[12px] flex-1" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
              <h3 className="text-lg font-bold mb-1" style={{ color: '#19130E' }}>{day.day}: {day.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b5e50' }}>{day.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
