import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, LocationIcon, CalendarIcon, ChevronDownIcon } from '../ui/Icons';

const LOCATIONS = [
  'Junagadh Office Location',
];

const TYPES = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike/Scooter'];

export default function SearchWidget() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [form, setForm] = useState({ location: 'Junagadh Office Location', from: '', to: '', type: '' });

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
    localStorage.setItem('searchCriteria', JSON.stringify(form));
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(form).filter(([, v]) => v)),
    );
    navigate(`/cars?${params}`);
  };

  const fieldInputStyle = { background: '#F2EEE5', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' };

  return (
    <div className="w-full relative z-10">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <Field id="sw-location" label="Pick-up Location" icon={LocationIcon}>
          <select id="sw-location" value={form.location} onChange={update('location')}
            className="field-input appearance-none h-[54px] pr-10" style={fieldInputStyle}>
            {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b5e50' }} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field id="sw-from" label="Pick-up Date" icon={CalendarIcon}>
            <input id="sw-from" type="date" value={form.from} min={today} onChange={update('from')}
              className="field-input h-[54px]" style={fieldInputStyle} />
          </Field>
          <Field id="sw-to" label="Drop-off Date" icon={CalendarIcon}>
            <input id="sw-to" type="date" value={form.to} min={form.from || today} onChange={update('to')}
              className="field-input h-[54px]" style={fieldInputStyle} />
          </Field>
        </div>

        <Field id="sw-type" label="Vehicle Type" icon={CarIcon}>
          <select id="sw-type" value={form.type} onChange={update('type')}
            className="field-input appearance-none h-[54px] pr-10" style={fieldInputStyle}>
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b5e50' }} />
        </Field>

        <button type="submit" className="w-full font-bold text-[16px] py-4 rounded-[8px] flex items-center justify-center gap-2 mt-2"
          style={{ background: '#19130E', color: '#F9F8F3' }}>
          Search Cars
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: '#6b5e50' }}>{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10" style={{ color: '#6b5e50' }}>
          <Icon className="w-5 h-5" />
        </div>
        {children}
      </div>
    </div>
  );
}
