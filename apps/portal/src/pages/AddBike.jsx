import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCar } from '../api/cars.js';
import toast from 'react-hot-toast';

const BIKE_CATEGORIES = ['bike', 'scooter', 'cruiser', 'sportsbike'];
const FUEL_TYPES = ['Petrol', 'Electric'];

export default function AddBike() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'bike',
    make: '', model: '', year: new Date().getFullYear().toString(),
    category: 'bike', pricePerDay: '', description: '', location: 'Junagadh',
    fuelType: 'Petrol'
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const handleImages = (e) => setImages([...e.target.files]);

  const validate = () => {
    const errs = {};
    if (!form.make.trim()) errs.make = 'Make is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.pricePerDay || form.pricePerDay <= 0) errs.pricePerDay = 'Valid price is required';
    if (!form.description.trim() || form.description.length < 20) errs.description = 'Description must be at least 20 characters';
    if (!form.location.trim()) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createCar({ ...form, pricePerDay: Number(form.pricePerDay), year: Number(form.year), images });
      toast.success('Bike added successfully!');
      navigate('/fleet');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full px-4 py-3 border rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors[field] ? 'border-red-500' : 'border-outline-variant'}`;

  return (
    <div className="p-6 lg:p-12 max-w-[1000px] mx-auto w-full pb-24 md:pb-6">
      <div className="mb-8">
        <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Add New Bike</h2>
        <p className="text-on-surface-variant">Fill in the details to add a bike to your fleet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
          <h3 className="font-label-large font-semibold text-on-surface">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Make *</label>
              <input type="text" value={form.make} onChange={set('make')} placeholder="e.g. Honda" className={inputClass('make')} />
              {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Model *</label>
              <input type="text" value={form.model} onChange={set('model')} placeholder="e.g. Activa 6G" className={inputClass('model')} />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Year *</label>
              <input type="number" value={form.year} onChange={set('year')} min="2015" max={new Date().getFullYear() + 1} className={inputClass('year')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Category *</label>
              <select value={form.category} onChange={set('category')} className={inputClass('category')}>
                {BIKE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Fuel Type</label>
              <select value={form.fuelType} onChange={set('fuelType')} className={inputClass('fuelType')}>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Location *</label>
              <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Junagadh" className={inputClass('location')} />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
          <h3 className="font-label-large font-semibold text-on-surface">Pricing & Description</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Price Per Day (₹) *</label>
              <input type="number" value={form.pricePerDay} onChange={set('pricePerDay')} min="0" placeholder="500" className={inputClass('pricePerDay')} />
              {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">{errors.pricePerDay}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Images</label>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImages}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Description * (min 20 chars)</label>
            <textarea value={form.description} onChange={set('description')} rows="4"
              placeholder="Describe the bike features, condition, and any extras…"
              className={inputClass('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/fleet')} className="px-6 py-3 border border-outline-variant rounded-xl font-semibold hover:bg-surface transition-colors">Cancel</button>
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-dark text-white rounded-xl font-black hover:bg-black/90 transition-colors disabled:opacity-50 shadow-lg shadow-dark/20">
            {loading ? 'Adding...' : 'Add Bike to Fleet'}
          </button>
        </div>
      </form>
    </div>
  );
}
