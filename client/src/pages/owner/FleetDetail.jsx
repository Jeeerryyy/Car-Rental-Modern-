import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['Sedan', 'SUV', 'Luxury', 'Sports', 'Hatchback', 'Bike', 'Scooter'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

export default function FleetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', category: '', pricePerDay: '', transmission: '',
    fuelType: '', description: '', location: '', latitude: '', longitude: '',
    securityDeposit: '', features: []
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [keepImageIds, setKeepImageIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      const res = await axiosInstance.get(`/owner/cars/${id}`);
      const c = res.data.data;
      setCar(c);
      setFormData({
        make: c.make || '',
        model: c.model || '',
        year: c.year || '',
        category: c.category || '',
        pricePerDay: c.pricePerDay || '',
        transmission: c.transmission || '',
        fuelType: c.fuelType || '',
        description: c.description || '',
        location: c.location?.address || '',
        latitude: c.location?.coordinates?.lat || '',
        longitude: c.location?.coordinates?.lng || '',
        securityDeposit: c.securityDeposit || '',
        features: c.features || []
      });
      setKeepImageIds(c.images?.map(img => img.publicId) || []);
    } catch (err) {
      toast.error('Failed to load car');
      navigate('/owner/fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageRemove = (publicId) => {
    setKeepImageIds(prev => prev.filter(pid => pid !== publicId));
  };

  const handleNewImages = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      keepImageIds.forEach(pid => data.append('keepPublicIds', pid));
      newImages.forEach(img => data.append('images', img));
      
      await axiosInstance.put(`/owner/cars/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Car updated successfully');
      navigate('/owner/fleet');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update car');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/owner/cars/${id}`);
      toast.success('Car deleted');
      navigate('/owner/fleet');
    } catch (err) {
      if (err.response?.data?.deactivated) {
        toast.success('Car deactivated (has active bookings)');
        navigate('/owner/fleet');
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete car');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Edit Car</h1>
        <button onClick={() => navigate('/owner/fleet')} className="text-on-surface-variant hover:text-on-surface">
          ← Back to Fleet
        </button>
      </div>

      {car?.isDeleted && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
          This car has been deactivated due to existing booking history.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
          <h2 className="text-lg font-semibold mb-4">Car Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {car?.images?.filter(img => keepImageIds.includes(img.publicId)).map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt={`Car ${i}`} className="w-full h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleImageRemove(img.publicId)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="block">
            <span className="text-sm font-medium">Add New Images</span>
            <input type="file" multiple accept="image/*" onChange={handleNewImages} className="mt-1 block w-full" />
          </label>
        </div>

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

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 bg-primary-container text-on-primary py-3 rounded-lg font-medium hover:bg-surface-tint disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
            Delete Car
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Delete Car?</h3>
            <p className="text-on-surface-variant mb-4">This will permanently delete "{car?.make} {car?.model}". This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-outline-variant rounded-lg font-medium">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}