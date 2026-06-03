import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HandshakeIcon, StarIcon, OfferIcon, RestaurantIcon, CarIcon } from '../ui/Icons';

export default function PartnershipPortal({ partners }) {
  const [activeTab, setActiveTab] = useState('hotels');

  const tabStyle = (active) => ({
    background: active ? '#E7E0D4' : 'transparent',
    color: active ? '#121212' : '#5C5C5C',
    borderBottom: active ? '2px solid #121212' : '2px solid transparent',
  });

  return (
    <div className="rounded-[12px] sticky top-[100px] overflow-hidden" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
      <div className="p-6" style={{ background: '#121212' }}>
        <h2 className="text-xl font-display font-bold mb-2 flex items-center gap-2" style={{ color: '#F4F1EA' }}>
          <HandshakeIcon className="w-6 h-6" style={{ color: '#A56A43' }} />
          Partnership Portal
        </h2>
        <p className="text-xs" style={{ color: 'rgba(214,208,199,0.5)' }}>Exclusive tie-ups &amp; real-time booking availability for Modern Selfdrive customers.</p>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #D6D0C7', background: '#E7E0D4' }}>
        <button onClick={() => setActiveTab('hotels')} className="flex-1 py-3 text-sm font-bold text-center" style={tabStyle(activeTab === 'hotels')}>Boutique Hotels</button>
        <button onClick={() => setActiveTab('dining')} className="flex-1 py-3 text-sm font-bold text-center" style={tabStyle(activeTab === 'dining')}>Local Dining</button>
      </div>

      <div className="p-6">
        {activeTab === 'hotels' ? (
          <div className="space-y-6">
            {partners.hotels.map(h => (
              <div key={h.name} className="rounded-[8px] p-4" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm" style={{ color: '#121212' }}>{h.name}</h3>
                  <div className="flex items-center text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: '#121212', background: '#E7E0D4' }}>
                    <StarIcon className="w-3.5 h-3.5 mr-1" style={{ color: '#A56A43' }} fill="currentColor" />
                    {h.rating}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: '#D6D0C7', color: '#9B6A3C' }}>Only {h.roomsLeft} left</span>
                  <span className="font-bold text-sm" style={{ color: '#121212' }}>{h.price} <span className="text-xs font-normal" style={{ color: '#5C5C5C' }}>/night</span></span>
                </div>
                <div className="flex items-start gap-1.5 p-2 rounded text-xs font-medium mb-3" style={{ background: 'rgba(182,124,61,0.1)', color: '#556B57' }}>
                  <OfferIcon className="w-4 h-4" />
                  {h.perk}
                </div>
                <button className="w-full text-xs font-bold py-2 rounded" style={{ background: '#121212', color: '#F4F1EA' }}>Book via Partner</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {partners.dining.map(d => (
              <div key={d.name} className="rounded-[8px] p-4" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm" style={{ color: '#121212' }}>{d.name}</h3>
                  <div className="flex items-center text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: '#121212', background: '#E7E0D4' }}>
                    <StarIcon className="w-3.5 h-3.5 mr-1" style={{ color: '#A56A43' }} fill="currentColor" />
                    {d.rating}
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: '#5C5C5C' }}>{d.cuisine}</p>
                <div className="flex items-start gap-1.5 p-2 rounded text-xs font-medium mb-3" style={{ background: 'rgba(182,124,61,0.1)', color: '#556B57' }}>
                  <RestaurantIcon className="w-4 h-4" />
                  {d.perk}
                </div>
                <button className="w-full text-xs font-bold py-2 rounded" style={{ border: '1px solid #121212', color: '#121212', background: 'transparent' }}>Reserve Table</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6" style={{ background: '#E7E0D4', borderTop: '1px solid #D6D0C7' }}>
        <h3 className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: '#121212' }}>
          <CarIcon className="w-5 h-5" />
          Need transport?
        </h3>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: '#5C5C5C' }}>Book a premium self-drive vehicle or chauffeur service to easily access these partnered locations.</p>
        <Link to="/cars" className="block w-full text-center text-sm py-2.5 rounded-[8px] font-bold no-underline" style={{ background: '#121212', color: '#F4F1EA' }}>Explore Fleet</Link>
      </div>
    </div>
  );
}
