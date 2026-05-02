import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  XIcon, SaveIcon, CameraIcon, ActivityIcon,
  SettingsIcon, CheckCircleIcon, StarIcon, ChevronLeftIcon
} from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const VehicleProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const initialFormState = {
    make: '', model: '', year: new Date().getFullYear(), category: 'SUV', 
    fuelType: 'Petrol', transmission: 'Manual',
    seats: 5, pricePerDay: 0, pricePerHour: 100,
    images: [], licensePlate: '',
    isPopular: false, isFeatured: false,
    status: 'Available', driveOption: 'Self Drive',
    securityDeposit: 0, features: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isEdit) fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/api/admin/cars/${id}`);
      const car = res.data;
      setFormData({
        ...car,
        features: Array.isArray(car.features) ? car.features.join(', ') : car.features || ''
      });
    } catch (err) {
      toast.error('Failed to load vehicle data');
      navigate('/owner/fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (typeof payload.images === 'string') payload.images = [payload.images];
      if (typeof payload.features === 'string') {
        payload.features = payload.features.split(',').map(f => f.trim()).filter(f => f);
      }

      if (isEdit) {
        await api.patch(`/api/admin/cars/${id}`, payload);
        toast.success('Vehicle Updated');
      } else {
        await api.post('/api/admin/cars', payload);
        toast.success('Vehicle Registered');
      }
      navigate('/owner/fleet');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Retrieving Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/owner/fleet')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Profile</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Control Center • {isEdit ? 'Update Existing' : 'New Entry'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/owner/fleet')}
            className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-black transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Confirm Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-8">
            {/* Technical */}
            <section className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <SettingsIcon className="w-3 h-3" /> Technical Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Brand / Make</label>
                  <input required className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold focus:ring-1 focus:ring-gray-200 transition-all outline-none" placeholder="e.g. Hyundai" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model Name</label>
                  <input required className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold focus:ring-1 focus:ring-gray-200 transition-all outline-none" placeholder="e.g. Grand i10" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Plate</label>
                  <input required className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-mono font-bold uppercase focus:ring-1 focus:ring-gray-200 transition-all outline-none" placeholder="GJ 01 XX 0000" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold appearance-none cursor-pointer outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Hatchback">Hatchback</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Luxury">Luxury</option><option value="Bike">Bike</option><option value="Scooter">Scooter</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fuel Type</label>
                  <select className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold outline-none" value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="CNG">CNG</option><option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transmission</label>
                  <select className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold outline-none" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                    <option value="Manual">Manual</option><option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seats</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold outline-none" value={formData.seats} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} />
                </div>
              </div>
            </section>

            {/* Economics */}
            <section className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ActivityIcon className="w-3 h-3" /> Economics & Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Day Rate (₹)</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-bold outline-none" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hour Rate (₹)</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-bold outline-none" value={formData.pricePerHour} onChange={e => setFormData({...formData, pricePerHour: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Security Deposit (₹)</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-bold outline-none" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Drive Option</label>
                  <select className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold outline-none" value={formData.driveOption} onChange={e => setFormData({...formData, driveOption: e.target.value})}>
                    <option value="Self Drive">Self Drive Only</option><option value="With Driver">With Driver Only</option><option value="Both">Both Options</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operational Status</label>
                  <select className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-sm font-semibold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Available">Available for Rent</option><option value="Maintenance">Under Maintenance</option><option value="Rented">Currently Rented</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Assets & Toggles */}
        <div className="space-y-8">
          <section className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <CameraIcon className="w-3 h-3" /> Digital Assets
            </h3>
            <div className="space-y-6">
              <div className="aspect-[16/10] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {formData.images?.[0] ? (
                  <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <CameraIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                <input className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-[11px] font-medium outline-none" placeholder="https://..." value={Array.isArray(formData.images) ? formData.images[0] || '' : formData.images} onChange={e => setFormData({...formData, images: [e.target.value]})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Features (Comma Sep)</label>
                <textarea className="w-full bg-gray-50 border-none rounded-lg p-3.5 text-xs font-medium h-24 resize-none outline-none" placeholder="AC, Bluetooth, etc." value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, isPopular: !formData.isPopular})}
              className={`w-full flex items-center justify-between p-5 rounded-lg border transition-all ${
                formData.isPopular ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-100' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <ActivityIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Popular Choice</span>
              </div>
              {formData.isPopular && <CheckCircleIcon className="w-4 h-4 text-amber-600" />}
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
              className={`w-full flex items-center justify-between p-5 rounded-lg border transition-all ${
                formData.isFeatured ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <StarIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Featured Badge</span>
              </div>
              {formData.isFeatured && <CheckCircleIcon className="w-4 h-4 text-blue-600" />}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VehicleProfile;
