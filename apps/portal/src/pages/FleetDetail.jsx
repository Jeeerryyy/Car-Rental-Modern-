import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCarById, updateCar, deleteCar, addBlockedDates, removeBlockedDates } from '../api/cars.js';
import { useOwnerAuth } from '../context/OwnerAuthContext.jsx';
import toast from 'react-hot-toast';

const CATEGORIES = ['hatchback', 'sedan', 'suv', 'luxury', 'sports', 'van'];
const BIKE_CATEGORIES = ['bike', 'scooter', 'cruiser', 'sportsbike'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'AMT'];
const DRIVE_OPTIONS = ['Self Drive', 'With Driver', 'Both'];

export default function FleetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useOwnerAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]); // publicIds
  const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      const res = await getCarById(id);
      const c = res.data.data.car;
      setCar(c);
      setForm({
        make: c.make || '',
        model: c.model || '',
        year: c.year || new Date().getFullYear(),
        category: c.category || 'sedan',
        pricePerDay: c.pricePerDay || '',
        description: c.description || '',
        location: c.location || '',
        fuelType: c.fuelType || 'Petrol',
        transmission: c.transmission || 'Automatic',
        seats: c.seats || 5,
        driveOption: c.driveOption || 'Self Drive',
        color: c.color || '',
        registrationNumber: c.registrationNumber || ''
      });
    } catch (err) {
      toast.error('Car not found');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        pricePerDay: Number(form.pricePerDay), 
        year: Number(form.year), 
        seats: car.type === 'bike' ? undefined : Number(form.seats),
        removeImages: JSON.stringify(removeImages),
        images: newImages 
      };
      await updateCar(id, payload);
      toast.success('Car updated successfully');
      setNewImages([]);
      setRemoveImages([]);
      fetchCar();
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
      fetchCar();
      setBlockForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveBlock = async (blockId) => {
    try {
      await removeBlockedDates(id, blockId);
      toast.success('Blocked date removed');
      fetchCar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleRemoveImage = (publicId) => {
    setRemoveImages(prev => 
      prev.includes(publicId) ? prev.filter(id => id !== publicId) : [...prev, publicId]
    );
  };

  if (loading) return (
    <div className="p-6 lg:p-12 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="p-6 lg:p-12 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">directions_car</span>
      </div>
      <h2 className="text-2xl font-black text-on-surface mb-2">Car not found</h2>
      <p className="text-on-surface-variant mb-8">The vehicle you are looking for doesn't exist or you don't have permission to view it.</p>
      <Link to="/fleet" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold inline-block hover:shadow-lg transition-all">Back to Fleet</Link>
    </div>
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1200px] mx-auto w-full pb-24 md:pb-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-display font-black text-dark tracking-tight">{car.make} {car.model}</h2>
            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${car.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {car.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-muted font-medium">Manage your vehicle listing and availability</p>
        </div>
        <Link to="/fleet" className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Fleet
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Vehicle Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Make</label>
                  <input type="text" value={form.make} onChange={set('make')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Model</label>
                  <input type="text" value={form.model} onChange={set('model')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Year</label>
                  <input type="number" value={form.year} onChange={set('year')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Category</label>
                  <select value={form.category} onChange={set('category')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface">
                    {(car.type === 'bike' ? BIKE_CATEGORIES : CATEGORIES).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <h3 className="text-lg font-black text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings_input_component</span>
                Technical Specs
              </h3>
              <div className={`grid grid-cols-1 ${car.type === 'bike' ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-6`}>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Fuel Type</label>
                  <select value={form.fuelType} onChange={set('fuelType')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface">
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {car.type !== 'bike' ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Transmission</label>
                      <select value={form.transmission} onChange={set('transmission')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface">
                        {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Drive Option</label>
                      <select value={form.driveOption} onChange={set('driveOption')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface">
                        {DRIVE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </>
                ) : null}
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Color</label>
                  <input type="text" value={form.color} onChange={set('color')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Registration No.</label>
                  <input type="text" value={form.registrationNumber} onChange={set('registrationNumber')} disabled={!isOwner} placeholder="e.g. GJ 11 AB 1234" className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <h3 className="text-lg font-black text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Pricing & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Price/Day (₹)</label>
                  <input type="number" value={form.pricePerDay} onChange={set('pricePerDay')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
                {car.type !== 'bike' && (
                  <div>
                    <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Seats</label>
                    <input type="number" value={form.seats} onChange={set('seats')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Location</label>
                  <input type="text" value={form.location} onChange={set('location')} disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Description</label>
              <textarea value={form.description} onChange={set('description')} rows="4" disabled={!isOwner} className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:bg-surface-container-low text-on-surface" />
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <h3 className="text-lg font-black text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">image</span>
                Vehicle Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {car.images?.map(img => (
                  <div key={img.publicId} className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant group">
                    <img src={img.url} alt="" className={`w-full h-full object-cover transition-opacity ${removeImages.includes(img.publicId) ? 'opacity-30 grayscale' : ''}`} />
                    <button type="button" onClick={() => toggleRemoveImage(img.publicId)} 
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="material-symbols-outlined">{removeImages.includes(img.publicId) ? 'undo' : 'delete'}</span>
                    </button>
                    {removeImages.includes(img.publicId) && (
                      <div className="absolute top-1 right-1 bg-red-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase">To Delete</div>
                    )}
                  </div>
                ))}
                <label className="aspect-video rounded-xl border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">add_a_photo</span>
                  <span className="text-[10px] font-bold text-on-surface-variant mt-1">Add Photo</span>
                  <input type="file" multiple className="hidden" onChange={e => setNewImages([...e.target.files])} />
                </label>
              </div>
              {newImages.length > 0 && (
                <p className="text-xs font-bold text-primary mb-4">{newImages.length} new photos selected</p>
              )}
            </div>

            {isOwner && (
              <div className="flex justify-end pt-8">
                <button type="submit" disabled={saving} className="bg-dark text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-black/90 transition-all disabled:opacity-50 shadow-xl shadow-dark/20 flex items-center gap-3">
                  {saving ? (
                    <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined">save</span> Save All Changes</>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event_busy</span>
              Block Availability
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 font-medium">Prevent bookings for specific dates (e.g. maintenance).</p>
            
            {isOwner && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Start Date</label>
                  <input type="date" value={blockForm.startDate} onChange={e => setBlockForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">End Date</label>
                  <input type="date" value={blockForm.endDate} min={blockForm.startDate} onChange={e => setBlockForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Reason (Optional)</label>
                  <input type="text" value={blockForm.reason} onChange={e => setBlockForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="e.g. Service" className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
                </div>
                <button onClick={handleAddBlock} className="w-full py-3 bg-primary-container text-on-primary rounded-xl font-black text-sm hover:bg-surface-tint transition-all">Add Block Date</button>
              </div>
            )}

            {car.unavailableDates?.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-outline-variant">
                <p className="text-xs font-black text-secondary uppercase tracking-widest">Active Blocks</p>
                {car.unavailableDates.map(block => (
                  <div key={block._id} className="p-3 bg-surface border border-outline-variant rounded-xl flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-black text-on-surface">{new Date(block.startDate).toLocaleDateString()} – {new Date(block.endDate).toLocaleDateString()}</p>
                      {block.reason && <p className="text-xs text-muted font-medium">{block.reason}</p>}
                    </div>
                    {isOwner && (
                      <button onClick={() => handleRemoveBlock(block._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {isOwner && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 className="text-red-800 font-black mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Danger Zone
              </h3>
              <p className="text-xs text-red-600 font-medium mb-4">Deleting this car will remove it from the fleet permanently. Active bookings must be completed first.</p>
              <button onClick={async () => {
                if (confirm('Are you sure you want to delete this car?')) {
                  try {
                    await deleteCar(id);
                    toast.success('Car deleted');
                    navigate('/fleet');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Delete failed');
                  }
                }
              }} className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-black text-sm hover:bg-red-200 transition-all">Delete Vehicle</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
