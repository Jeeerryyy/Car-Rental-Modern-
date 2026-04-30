import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const LOCATIONS = [
  'Junagadh City',
  'Junagadh Airport (IATA: JGA)',
  'Keshod Airport',
  'Somnath',
  'Gir',
  'Veraval',
  'Porbandar',
  'Rajkot',
];

const TYPES = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike/Scooter'];

export default function SearchWidget() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [form, setForm] = useState({ location: '', from: '', to: '', type: '' });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.from && form.to && form.to <= form.from) {
      alert('Drop-off date must be after pick-up date');
      return;
    }
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(form).filter(([, v]) => v)),
    );
    navigate(`/cars?${params}`);
  };

  return (
    <div className="bg-white rounded-[var(--radius-lg)] shadow-md border border-border p-4 md:p-6 w-full max-w-[1100px] mx-auto transform -translate-y-1/2 relative z-10">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4 md:gap-6">

        <Field id="sw-location" label="Pick-up Location" icon="location_on">
          <select id="sw-location" value={form.location} onChange={update('location')} className="field-input appearance-none bg-white">
            <option value="">Select Location</option>
            {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </Field>

        <Field id="sw-from" label="Pick-up Date" icon="calendar_today">
          <input id="sw-from" type="date" value={form.from} min={today} onChange={update('from')} className="field-input" />
        </Field>

        <Field id="sw-to" label="Drop-off Date" icon="event">
          <input id="sw-to" type="date" value={form.to} min={form.from || today} onChange={update('to')} className="field-input" />
        </Field>

        <Field id="sw-type" label="Vehicle Type" icon="directions_car">
          <select id="sw-type" value={form.type} onChange={update('type')} className="field-input appearance-none bg-white">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        <button type="submit" className="bg-dark text-white font-semibold text-[15px] px-8 py-3.5 rounded-md hover:bg-dark-2 transition-colors w-full md:w-auto h-[46px] flex items-center justify-center">
          Search Cars
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="flex-1 w-full">
      <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[20px]">{icon}</span>
        {children}
      </div>
    </div>
  );
}
