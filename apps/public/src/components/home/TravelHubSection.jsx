import React from 'react';
import { Link } from 'react-router-dom';
import { CarIcon, SearchIcon, LocationIcon } from '../ui/Icons';

export default function TravelHubSection({ selectedDestination, setSelectedDestination }) {
  return (
    <section className="py-20" style={{ background: '#F9F8F3' }}>
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#19130E' }}>Your Travel Hub</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#6b5e50' }}>Everything you need for your Saurashtra journey in one seamless platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[12px] flex flex-col justify-between" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
            <div>
              <CarIcon className="w-10 h-10 mb-6" style={{ color: '#B67C3D' }} />
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#19130E' }}>Rent a Vehicle</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6b5e50' }}>Aadhaar-verified self-drive cars, chauffeur services, or 24/7 airport transfers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <Link to="/cars" className="btn-primary flex items-center justify-center text-sm py-3 px-2">Self-Drive</Link>
              <Link to="/cars" className="btn-outline flex items-center justify-center text-sm py-3 px-2">With Driver</Link>
            </div>
          </div>
          <div className="p-10 rounded-[12px] flex flex-col justify-between" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
            <div>
              <SearchIcon className="w-10 h-10 mb-6" style={{ color: '#B67C3D' }} />
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#19130E' }}>Plan a Trip</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6b5e50' }}>Select a destination to view curated itineraries, hidden gems, and book partner hotels & dining.</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mt-auto">
              <div className="relative w-full">
                <LocationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#6b5e50' }} />
                <select className="w-full py-3 pl-12 pr-10 rounded-[8px] appearance-none cursor-pointer text-sm" style={{ background: '#EBE6DE', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }} value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
                  <option value="gir-national-park">Gir National Park</option>
                  <option value="somnath-temple">Somnath Temple</option>
                  <option value="diu">Diu Island</option>
                  <option value="dwarka">Dwarka</option>
                  <option value="rajkot">Rajkot City</option>
                  <option value="porbandar">Porbandar</option>
                  <option value="rann-of-kutch">Rann of Kutch</option>
                </select>
              </div>
              <Link to={`/destinations/${selectedDestination}`} className="btn-primary flex items-center justify-center text-sm py-3 px-6 whitespace-nowrap mt-4 sm:mt-0">Plan Trip</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
