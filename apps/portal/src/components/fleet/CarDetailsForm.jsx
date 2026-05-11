import React from 'react';

const CATEGORIES = ['Sedan', 'SUV', 'Luxury', 'Sports', 'Hatchback', 'Bike', 'Scooter'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

export default function CarDetailsForm({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
        <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Make</label>
            <input value={formData.make} onChange={handleChange('make')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input value={formData.model} onChange={handleChange('model')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input type="number" value={formData.year} onChange={handleChange('year')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={formData.category} onChange={handleChange('category')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface">
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
        <h2 className="text-lg font-semibold mb-4">Pricing & Specs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price per Day (₹)</label>
            <input type="number" value={formData.pricePerDay} onChange={handleChange('pricePerDay')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Security Deposit (₹)</label>
            <input type="number" value={formData.securityDeposit} onChange={handleChange('securityDeposit')} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transmission</label>
            <select value={formData.transmission} onChange={handleChange('transmission')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface">
              <option value="">Select</option>
              {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Type</label>
            <select value={formData.fuelType} onChange={handleChange('fuelType')} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface">
              <option value="">Select</option>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
        <h2 className="text-lg font-semibold mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input value={formData.location} onChange={handleChange('location')} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input type="number" step="any" value={formData.latitude} onChange={handleChange('latitude')} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input type="number" step="any" value={formData.longitude} onChange={handleChange('longitude')} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <textarea value={formData.description} onChange={handleChange('description')} rows={4} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" />
      </div>
    </div>
  );
}
