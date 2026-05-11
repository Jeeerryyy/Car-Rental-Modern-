import React from 'react';
import { XIcon, CheckIcon } from '../ui/Icons';

export default function SidebarFilters({
  filterOpen,
  setFilterOpen,
  localFilters,
  setLocalFilters,
  clearFilters,
  applyFilters,
  toggleType
}) {
  return (
    <>
      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
          onClick={() => setFilterOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-[300px] lg:w-[280px] z-[85] lg:z-auto flex-shrink-0 bg-white lg:bg-transparent transform transition-transform duration-300 lg:transform-none ${filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}
      >
        <div className="bg-white p-6 rounded-none lg:rounded-[var(--radius-md)] shadow-sm lg:border lg:border-border lg:sticky lg:top-[100px]">
          <h3 className="font-display text-xl font-bold text-dark mb-6 flex items-center justify-between">
            Filters
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-muted hover:text-dark uppercase tracking-wider"
              >
                Clear
              </button>
              <button
                className="lg:hidden text-muted hover:text-dark"
                onClick={() => setFilterOpen(false)}
                aria-label="Close filters"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </h3>

          {/* Price Range */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-dark mb-4">Max Price / Day</h4>
            <input
              type="range" min="500" max="10000" step="500"
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
              className="w-full accent-dark"
            />
            <div className="flex justify-between text-sm mt-2 font-medium">
              <span className="text-muted">₹500</span>
              <span className="text-dark">₹{Number(localFilters.maxPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-dark mb-4">Vehicle Type</h4>
            <div className="flex flex-col gap-3">
              {['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.type.includes(type.toLowerCase()) ? 'bg-dark border-dark' : 'border-border group-hover:border-dark bg-white'}`}
                  >
                    {localFilters.type.includes(type.toLowerCase()) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={localFilters.type.includes(type.toLowerCase())}
                    onChange={() => toggleType(type)}
                  />
                  <span className="text-sm text-dark font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Drive Option */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-dark mb-4">Drive Option</h4>
            <div className="flex flex-col gap-3">
              {['Self Drive', 'With Driver', 'Both'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio" name="driveOption"
                    className="accent-dark w-4 h-4"
                    checked={localFilters.driveOption === opt}
                    onChange={() => setLocalFilters((p) => ({ ...p, driveOption: opt }))}
                    onClick={() => localFilters.driveOption === opt && setLocalFilters((p) => ({ ...p, driveOption: '' }))}
                  />
                  <span className="text-sm text-dark font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-dark mb-4">Transmission</h4>
            <div className="flex bg-off p-1 rounded-md border border-border">
              {['Automatic', 'Manual'].map((t) => (
                <button
                  key={t}
                  onClick={() => setLocalFilters((p) => ({ ...p, transmission: p.transmission === t ? '' : t }))}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${localFilters.transmission === t ? 'bg-white shadow-sm text-dark' : 'text-muted hover:text-dark'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-dark mb-4">Fuel Type</h4>
            <div className="flex flex-col gap-3">
              {['Petrol', 'Diesel', 'CNG', 'Electric'].map((fuel) => (
                <label key={fuel} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio" name="fuelType"
                    className="accent-dark w-4 h-4"
                    checked={localFilters.fuelType === fuel}
                    onChange={() => setLocalFilters((p) => ({ ...p, fuelType: fuel }))}
                    onClick={() => localFilters.fuelType === fuel && setLocalFilters((p) => ({ ...p, fuelType: '' }))}
                  />
                  <span className="text-sm text-dark font-medium">{fuel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full bg-dark text-white font-semibold py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
