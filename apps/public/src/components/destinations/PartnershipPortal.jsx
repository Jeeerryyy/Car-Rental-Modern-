import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HandshakeIcon, StarIcon, OfferIcon, RestaurantIcon, CarIcon } from '../ui/Icons';

export default function PartnershipPortal({ partners }) {
  const [activeTab, setActiveTab] = useState('hotels');

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-border shadow-lg sticky top-[100px] overflow-hidden">
      <div className="bg-dark text-white p-6">
        <h2 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
          <HandshakeIcon className="text-accent w-6 h-6" />
          Partnership Portal
        </h2>
        <p className="text-xs text-gray-400">Exclusive tie-ups & real-time booking availability for Modern Selfdrive customers.</p>
      </div>
      
      <div className="flex border-b border-border bg-off">
        <button 
          onClick={() => setActiveTab('hotels')}
          className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'hotels' ? 'bg-white text-dark border-b-2 border-dark' : 'text-muted'}`}
        >
          Boutique Hotels
        </button>
        <button 
          onClick={() => setActiveTab('dining')}
          className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'dining' ? 'bg-white text-dark border-b-2 border-dark' : 'text-muted'}`}
        >
          Local Dining
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'hotels' ? (
          <div className="space-y-6">
            {partners.hotels.map(h => (
              <div key={h.name} className="border border-border rounded-md p-4 bg-white hover:border-dark transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-dark text-sm">{h.name}</h3>
                  <div className="flex items-center text-xs font-bold text-dark bg-off px-1.5 py-0.5 rounded">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-500 mr-1" fill="currentColor" />
                    {h.rating}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded animate-pulse">
                    Only {h.roomsLeft} left
                  </span>
                  <span className="font-bold text-dark text-sm">{h.price} <span className="text-xs text-muted font-normal">/night</span></span>
                </div>
                <div className="flex items-start gap-1.5 bg-green-50 text-green-800 p-2 rounded text-xs font-medium mb-3">
                  <OfferIcon className="w-4 h-4" />
                  {h.perk}
                </div>
                <button className="w-full bg-dark text-white text-xs font-bold py-2 rounded transition-colors hover:opacity-90">
                  Book via Partner
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {partners.dining.map(d => (
              <div key={d.name} className="border border-border rounded-md p-4 bg-white hover:border-dark transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-dark text-sm">{d.name}</h3>
                  <div className="flex items-center text-xs font-bold text-dark bg-off px-1.5 py-0.5 rounded">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-500 mr-1" fill="currentColor" />
                    {d.rating}
                  </div>
                </div>
                <p className="text-xs text-muted mb-3">{d.cuisine}</p>
                <div className="flex items-start gap-1.5 bg-green-50 text-green-800 p-2 rounded text-xs font-medium mb-3">
                  <RestaurantIcon className="w-4 h-4" />
                  {d.perk}
                </div>
                <button className="w-full border border-dark text-dark text-xs font-bold py-2 rounded transition-colors hover:bg-dark hover:text-white">
                  Reserve Table
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-off p-6 border-t border-border">
        <h3 className="font-bold text-dark mb-2 text-sm flex items-center gap-2">
          <CarIcon className="w-5 h-5" />
          Need transport?
        </h3>
        <p className="text-xs text-muted mb-4 leading-relaxed">Book a premium self-drive vehicle or chauffeur service to easily access these partnered locations.</p>
        <Link to="/cars" className="btn-primary w-full justify-center text-sm py-2.5">Explore Fleet</Link>
      </div>
    </div>
  );
}
