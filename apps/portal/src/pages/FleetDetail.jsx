import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCarById, updateCar, deleteCar, addBlockedDates, removeBlockedDates } from '../api/cars.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['sedan', 'suv', 'luxury', 'sports', 'van'];

export default function FleetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    getCarById(id)
      .then(res => {
        const c = res.data.data.car;
        setCar(c);
        setForm({
          make: c.make, model: c.model, year: c.year, category: c.category,
          pricePerDay: c.pricePerDay, description: c.description, location: c.location,
          fuelType: c.fuelType || 'Petrol', transmission: c.transmission || 'Automatic',
          seats: c.seats || 5, driveOption: c.driveOption || 'Self Drive'
        });
      })
      .catch(() => toast.error('Car not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCar(id, { ...form, pricePerDay: Number(form.pricePerDay), year: Number(form.year), seats: Number(form.seats), removeImages: [] });
      toast.success('Car updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async () => {
    if (!blockForm.startDate || !blockForm.endDate) return;
    try {
      await addBlockedDates(id, blockForm);
      toast.success('Blocked dates added');
      const res = await getCarById(id);
      setCar(res.data.data.car);
      setBlockForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveBlock = async (blockId) => {
    try {
      await removeBlockedDates(id, blockId);
      toast.success('Blocked date removed');
      const res = await getCarById(id);
      setCar(res.data.data.car);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="p-6 lg:p-12"><div className="h-64 bg-surface rounded-xl animate-pulse" /></div>
  );

  if (!car) return (
    <div className="p-6 lg:p-12 text-center"><p>Car not found</p><Link to="/fleet" className="btn-primary mt-4 inline-block">Back to Fleet</Link></div>
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1000px] mx-auto w-full pb-24 md:pb-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-1">{car.make} {car.model}</h2>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${car.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {car.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <Link to="/fleet" className="px-4 py-2 text-sm font-bold bg-surface rounded-lg hover:bg-surface-tint">← Back</Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {['make', 'model', 'location'].map(field => (
            <div key={field}>
              <label className="block text-sm font-semibold text-dark mb-2 capitalize">{field}</label>
              <input type="text" value={form[field] || ''} onChange={set(field)}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Year</label>
            <input type="number" value={form.year || ''} onChange={set('year')} min="2015" max={new Date().getFullYear() + 1}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Category</label>
            <select value={form.category || 'sedan'} onChange={set('category')}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Price/Day (₹)</label>
            <input type="number" value={form.pricePerDay || ''} onChange={set('pricePerDay')}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Seats</label>
            <input type="number" value={form.seats || ''} onChange={set('seats')} min="2" max="12"
              className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Description</label>
          <textarea value={form.description || ''} onChange={set('description')} rows="3"
            className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
        </div>
        <button type="submit" disabled={saving}
          className="px-8 py-3 bg-dark text-white rounded-xl font-black hover:bg-black/90 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h3 className="font-label-large font-semibold text-on-surface mb-4">Block Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input type="date" value={blockForm.startDate} onChange={e => setBlockForm(p => ({ ...p, startDate: e.target.value }))}
            className="px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none" />
          <input type="date" value={blockForm.endDate} min={blockForm.startDate}
            onChange={e => setBlockForm(p => ({ ...p, endDate: e.target.value }))}
            className="px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none" />
          <input type="text" value={blockForm.reason} onChange={e => setBlockForm(p => ({ ...p, reason: e.target.value }))}
            placeholder="Reason (optional)" className="px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none" />
        </div>
        <button onClick={handleAddBlock} className="px-6 py-2 bg-dark text-white text-sm font-bold rounded-xl hover:bg-black/90">Add Block</button>

        {car.unavailableDates?.length > 0 && (
          <div className="mt-4 space-y-2">
            {car.unavailableDates.map(block => (
              <div key={block._id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <div>
                  <p className="text-sm font-bold">{new Date(block.startDate).toLocaleDateString()} – {new Date(block.endDate).toLocaleDateString()}</p>
                  {block.reason && <p className="text-xs text-muted">{block.reason}</p>}
                </div>
                <button onClick={() => handleRemoveBlock(block._id)} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
