import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CarIcon, SearchIcon, LocationIcon } from '../ui/Icons';

export default function TravelHubSection({ selectedDestination, setSelectedDestination }) {
  return (
    <section className="py-20" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#121212' }}>Your Travel Hub</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#5C5C5C' }}>Everything you need for your Saurashtra journey in one seamless platform.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="p-10 rounded-card flex flex-col justify-between" 
            style={{ background: '#F8F6F1', border: '1px solid #D6D0C7', boxShadow: '0 1px 3px rgba(18,18,18,0.04)' }}
          >
            <div>
              <CarIcon className="w-10 h-10 mb-6" style={{ color: '#A56A43' }} />
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#121212' }}>Rent a Vehicle</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: '#5C5C5C' }}>Aadhaar-verified self-drive cars, chauffeur services, or 24/7 airport transfers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <Link to="/cars" className="btn-primary rounded-btn flex items-center justify-center text-sm py-3 px-2">Self-Drive</Link>
              <Link to="/cars" className="btn-outline rounded-btn flex items-center justify-center text-sm py-3 px-2">With Driver</Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="p-10 rounded-card flex flex-col justify-between" 
            style={{ background: '#F8F6F1', border: '1px solid #D6D0C7', boxShadow: '0 1px 3px rgba(18,18,18,0.04)' }}
          >
            <div>
              <SearchIcon className="w-10 h-10 mb-6" style={{ color: '#A56A43' }} />
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#121212' }}>Plan a Trip</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: '#5C5C5C' }}>Select a destination to view curated itineraries, hidden gems, and book partner hotels & dining.</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mt-auto">
              <div className="relative w-full">
                <LocationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#5C5C5C' }} />
                <select className="w-full py-3 pl-12 pr-10 rounded-btn appearance-none cursor-pointer text-sm" style={{ background: '#F8F6F1', color: '#121212', border: '1px solid #D6D0C7' }} value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
                  <option value="gir-national-park">Gir National Park</option>
                  <option value="somnath-temple">Somnath Temple</option>
                  <option value="diu">Diu Island</option>
                  <option value="dwarka">Dwarka</option>
                  <option value="rajkot">Rajkot City</option>
                  <option value="porbandar">Porbandar</option>
                  <option value="rann-of-kutch">Rann of Kutch</option>
                </select>
              </div>
              <Link to={`/destinations/${selectedDestination}`} className="btn-primary rounded-btn flex items-center justify-center text-sm py-3 px-6 whitespace-nowrap mt-4 sm:mt-0">Plan Trip</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
