import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function AddCar() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '2024', category: 'Sedan', licensePlate: '', 
    fuelType: 'Petrol', transmission: 'Automatic', seats: '5', pricePerDay: '', 
    description: '', imageUrl: '', driveOption: 'Self Drive', location: 'Junagadh'
  });

  const handle = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = { ...formData };
      if (formData.imageUrl) {
        payload.images = [{ url: formData.imageUrl, publicId: `img_${Date.now()}` }];
      }

      const res = await api.post('/cars', payload);
      if (res.data.success) {
        toast.success('Vehicle added successfully');
        navigate('/owner/fleet');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 lg:p-12 max-w-5xl mx-auto w-full flex flex-col gap-12 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Add Vehicle</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Fill in the details below to add a new vehicle to the fleet.</p>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <button type="button" onClick={() => navigate('/owner/fleet')} className="border border-outline-variant text-on-surface-variant rounded-full px-6 py-2.5 font-body-md text-body-md hover:bg-surface-container transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="bg-primary-container text-on-primary rounded-full px-6 py-2.5 font-body-md text-body-md flex items-center gap-2 hover:bg-surface-tint transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">save</span>{isSubmitting ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </div>

      {/* Image URL (Simplified for now) */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant">
          <h3 className="font-headline-lg text-headline-lg text-primary text-base">Photos</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Provide a URL for the vehicle image.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Image URL</label>
            <input value={formData.imageUrl} onChange={handle('imageUrl')} placeholder="https://example.com/car.jpg" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" />
          </div>
        </div>
      </section>

      {/* Vehicle Details */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant">
          <h3 className="font-headline-lg text-headline-lg text-primary text-base">Vehicle Details</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Primary vehicle identification information.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Make */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Make *</label>
              <input required value={formData.make} onChange={handle('make')} placeholder="e.g. Mercedes-Benz" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" />
            </div>
            {/* Model */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Model *</label>
              <input required value={formData.model} onChange={handle('model')} placeholder="e.g. S-Class" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" />
            </div>
            {/* Year */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Year *</label>
              <select required value={formData.year} onChange={handle('year')} className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors cursor-pointer">
                {[2025, 2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* License Plate */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">License Plate *</label>
              <input required value={formData.licensePlate} onChange={handle('licensePlate')} placeholder="e.g. GJ-11-XX-1234" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50 uppercase" />
            </div>
            {/* Vehicle Class */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Vehicle Category *</label>
              <select required value={formData.category} onChange={handle('category')} className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors cursor-pointer">
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Luxury">Luxury</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>
            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Location</label>
              <input value={formData.location} onChange={handle('location')} placeholder="e.g. Junagadh" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant">
          <h3 className="font-headline-lg text-headline-lg text-primary text-base">Specifications & Pricing</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Fuel Type *</label>
              <select required value={formData.fuelType} onChange={handle('fuelType')} className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors cursor-pointer">
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            {/* Transmission */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Transmission *</label>
              <select required value={formData.transmission} onChange={handle('transmission')} className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors cursor-pointer">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            {/* Seats */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Seats *</label>
              <input required value={formData.seats} onChange={handle('seats')} type="number" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors" />
            </div>
            {/* Daily Rate */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Daily Rate (₹) *</label>
              <input required value={formData.pricePerDay} onChange={handle('pricePerDay')} type="number" placeholder="e.g. 1500" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" />
            </div>
            {/* Drive Option */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Drive Option *</label>
              <select required value={formData.driveOption} onChange={handle('driveOption')} className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors cursor-pointer">
                <option value="Self Drive">Self Drive</option>
                <option value="With Driver">With Driver</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant">
          <h3 className="font-headline-lg text-headline-lg text-primary text-base">Description</h3>
        </div>
        <div className="p-6">
          <textarea
            value={formData.description}
            onChange={handle('description')}
            placeholder="Write a detailed description of the vehicle, highlighting key features and condition..."
            rows={5}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface resize-y focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>
      </section>
    </form>
  );
}
