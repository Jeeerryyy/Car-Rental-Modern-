import React from 'react';
import { XIcon, CheckIcon } from '../ui/Icons';

export default function SidebarFilters({ filterOpen, setFilterOpen, localFilters, setLocalFilters, clearFilters, applyFilters, toggleType }) {
  const cardStyle = { background: '#E7E0D4', border: '1px solid #D6D0C7' };

  return (
    <>
      {filterOpen && (<div className="fixed inset-0 z-[80] lg:hidden" style={{ background: 'rgba(18,18,18,0.35)' }} onClick={() => setFilterOpen(false)} aria-hidden="true" />)}
      <aside className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-[300px] lg:w-[280px] z-[85] lg:z-auto flex-shrink-0 lg:transform-none ${filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}>
        <div className="p-6 rounded-none lg:rounded-[12px] lg:sticky lg:top-[100px] min-h-screen lg:min-h-0" style={cardStyle}>
          <h3 className="font-display text-xl font-bold mb-6 flex items-center justify-between" style={{ color: '#121212' }}>
            Filters
            <div className="flex items-center gap-3">
              <button onClick={clearFilters} className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5C5C5C' }}>Clear</button>
              <button className="lg:hidden" onClick={() => setFilterOpen(false)} aria-label="Close filters" style={{ color: '#5C5C5C' }}><XIcon className="w-6 h-6" /></button>
            </div>
          </h3>

          <div className="mb-8">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#121212' }}>Max Price / Day</h4>
            <input type="range" min="500" max="10000" step="500" value={localFilters.maxPrice} onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))} className="w-full" style={{ accentColor: '#121212' }} />
            <div className="flex justify-between text-sm mt-2 font-medium">
              <span style={{ color: '#5C5C5C' }}>₹500</span>
              <span style={{ color: '#121212' }}>₹{Number(localFilters.maxPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#121212' }}>Vehicle Type</h4>
            <div className="flex flex-col gap-3">
              {['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded flex items-center justify-center"
                    style={localFilters.type.includes(type.toLowerCase()) ? { background: '#121212', border: '1px solid #121212' } : { background: '#F4F1EA', border: '1px solid #D6D0C7' }}>
                    {localFilters.type.includes(type.toLowerCase()) && <CheckIcon className="w-3.5 h-3.5" style={{ color: '#F4F1EA' }} />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={localFilters.type.includes(type.toLowerCase())} onChange={() => toggleType(type)} />
                  <span className="text-sm font-medium" style={{ color: '#121212' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#121212' }}>Drive Option</h4>
            <div className="flex flex-col gap-3">
              {['Self Drive', 'With Driver', 'Both'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="driveOption" className="w-4 h-4" style={{ accentColor: '#121212' }} checked={localFilters.driveOption === opt} onChange={() => setLocalFilters((p) => ({ ...p, driveOption: opt }))} onClick={() => localFilters.driveOption === opt && setLocalFilters((p) => ({ ...p, driveOption: '' }))} />
                  <span className="text-sm font-medium" style={{ color: '#121212' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#121212' }}>Transmission</h4>
            <div className="flex p-1 rounded-[8px]" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              {['Automatic', 'Manual'].map((t) => (
                <button key={t} onClick={() => setLocalFilters((p) => ({ ...p, transmission: p.transmission === t ? '' : t }))}
                  className="flex-1 py-1.5 text-xs font-bold rounded-[6px]"
                  style={localFilters.transmission === t ? { background: '#F4F1EA', color: '#121212', boxShadow: '0 1px 3px rgba(18,18,18,0.06)' } : { color: '#5C5C5C' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#121212' }}>Fuel Type</h4>
            <div className="flex flex-col gap-3">
              {['Petrol', 'Diesel', 'CNG', 'Electric'].map((fuel) => (
                <label key={fuel} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="fuelType" className="w-4 h-4" style={{ accentColor: '#121212' }} checked={localFilters.fuelType === fuel} onChange={() => setLocalFilters((p) => ({ ...p, fuelType: fuel }))} onClick={() => localFilters.fuelType === fuel && setLocalFilters((p) => ({ ...p, fuelType: '' }))} />
                  <span className="text-sm font-medium" style={{ color: '#121212' }}>{fuel}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={applyFilters} className="w-full font-semibold py-3 rounded-[8px]" style={{ background: '#121212', color: '#F4F1EA' }}>Apply Filters</button>
        </div>
      </aside>
    </>
  );
}
