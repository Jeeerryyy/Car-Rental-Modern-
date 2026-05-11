import React from 'react';
import { Link } from 'react-router-dom';
import { CarIcon, SearchIcon, LocationIcon } from '../ui/Icons';

export default function TravelHubSection({ selectedDestination, setSelectedDestination }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-dark mb-4">Your Travel Hub</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">Everything you need for your Saurashtra journey in one seamless platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-10 rounded-[var(--radius-md)] border border-border shadow-sm flex flex-col justify-between">
            <div>
              <CarIcon className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-display text-2xl font-bold text-dark mb-3">Rent a Vehicle</h3>
              <p className="text-muted text-sm mb-8 leading-relaxed">Aadhaar-verified self-drive cars, chauffeur services, or 24/7 airport transfers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <Link to="/cars" className="btn-primary flex items-center justify-center text-sm py-3 px-2">Self-Drive</Link>
              <Link to="/cars" className="btn-outline flex items-center justify-center text-sm py-3 px-2 bg-off">With Driver</Link>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[var(--radius-md)] border border-border shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <SearchIcon className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-display text-2xl font-bold text-dark mb-3">Plan a Trip</h3>
              <p className="text-muted text-sm mb-8 leading-relaxed">Select a destination to view curated itineraries, hidden gems, and book partner hotels & dining.</p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mt-auto">
              <div className="relative w-full">
                <LocationIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                <select 
                  className="w-full bg-off text-dark border border-border py-3 pl-12 pr-10 rounded-sm appearance-none focus:outline-none focus:border-accent cursor-pointer transition-colors text-sm"
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                >
                  <option value="gir-national-park">Gir National Park</option>
                  <option value="somnath-temple">Somnath Temple</option>
                  <option value="diu">Diu Island</option>
                  <option value="dwarka">Dwarka</option>
                  <option value="rajkot">Rajkot City</option>
                  <option value="porbandar">Porbandar</option>
                  <option value="rann-of-kutch">Rann of Kutch</option>
                </select>

              </div>
              <Link to={`/destinations/${selectedDestination}`} className="btn-primary flex items-center justify-center text-sm py-3 px-6 shadow-sm whitespace-nowrap mt-4 sm:mt-0">
                Plan Trip
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
