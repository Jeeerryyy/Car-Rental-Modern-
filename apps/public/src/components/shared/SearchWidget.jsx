import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, LocationIcon, CalendarIcon, ChevronDownIcon } from '../ui/Icons';

const LOCATIONS = [
  'Junagadh City',
  'Junagadh Airport (IATA: JGA)',
  'Keshod Airport',
  'Somnath',
  'Gir',
  'Veraval',
  'Porbandar',
  'Rajkot',
  'Ahmedabad',
];

const TYPES = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike/Scooter'];

export default function SearchWidget() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [form, setForm] = useState({ location: '', from: '', to: '', type: '' });

  // Real-time persistence: save as user types/selects
  useEffect(() => {
    try {
      if (form.from || form.to || form.location || form.type) {
        localStorage.setItem('searchCriteria', JSON.stringify(form));
      }
    } catch (e) {
      console.error('Failed to save search criteria', e);
    }
  }, [form]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.from && form.to && form.to <= form.from) {
      alert('Drop-off date must be after pick-up date');
      return;
    }

    // Persist search criteria for the booking form
    localStorage.setItem('searchCriteria', JSON.stringify(form));

    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(form).filter(([, v]) => v)),
    );
    navigate(`/cars?${params}`);
  };

  return (
    <div className="w-full relative z-10">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">

        {/* Pick-up Location */}
        <Field id="sw-location" label="Pick-up Location" icon={LocationIcon}>
          <select
            id="sw-location"
            value={form.location}
            onChange={update('location')}
            className="field-input appearance-none bg-white h-[54px] border-none shadow-sm pr-10"
          >
            <option value="">Select Location</option>
            {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field id="sw-from" label="Pick-up Date" icon={CalendarIcon}>
            <input
              id="sw-from"
              type="date"
              value={form.from}
              min={today}
              onChange={update('from')}
              className="field-input h-[54px] border-none shadow-sm"
            />
          </Field>

          <Field id="sw-to" label="Drop-off Date" icon={CalendarIcon}>
            <input
              id="sw-to"
              type="date"
              value={form.to}
              min={form.from || today}
              onChange={update('to')}
              className="field-input h-[54px] border-none shadow-sm"
            />
          </Field>
        </div>

        {/* Vehicle Type */}
        <Field id="sw-type" label="Vehicle Type" icon={CarIcon}>
          <select
            id="sw-type"
            value={form.type}
            onChange={update('type')}
            className="field-input appearance-none bg-white h-[54px] border-none shadow-sm pr-10"
          >
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </Field>

        <button
          type="submit"
          className="w-full bg-dark text-white font-bold text-[16px] py-4 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 shadow-lg"
        >
          Search Cars
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-dark transition-colors z-10">
          <Icon className="w-5 h-5" />
        </div>
        {children}
      </div>
    </div>
  );
}
