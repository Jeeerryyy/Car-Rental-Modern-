import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../services/api';

const emptyForm = {
  make: '', model: '', year: '', category: 'Hatchback', pricePerDay: '', licensePlate: '', status: 'Available', images: [''],
  transmission: 'Manual', seats: 5, fuelType: 'Petrol', driveOption: 'Self Drive'
};

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get('/api/admin/cars');
      setCars(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (car) => {
    setEditingId(car._id);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      category: car.category,
      pricePerDay: car.pricePerDay,
      licensePlate: car.licensePlate,
      status: car.status,
      images: car.images && car.images.length > 0 ? car.images : [''],
      transmission: car.transmission,
      seats: car.seats,
      fuelType: car.fuelType,
      driveOption: car.driveOption
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/api/admin/cars/${editingId}`, formData);
      } else {
        await api.post('/api/admin/cars', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      fetchCars();
    } catch(err) {
      alert(err.response?.data?.error || 'Error saving vehicle');
    }
  };

  const handleDelete = async (id, make, model) => {
    if (!window.confirm(`Remove "${make} ${model}" from fleet?`)) return;
    try {
      await api.delete(`/api/admin/cars/${id}`);
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting vehicle');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  const statusColors = {
    Available: 'bg-blue-100 text-blue-800',
    Rented: 'bg-gray-100 text-gray-800',
    Maintenance: 'bg-red-100 text-red-800'
  };

  const filteredCars = cars.filter(car => {
    const typeMatch = filterType === 'All Types' || car.category === filterType;
    const statusMatch = filterStatus === 'All Statuses' || car.status === filterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <AdminSidebar>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark mb-1">Fleet Management</h1>
          <p className="text-sm text-muted">Add, edit, or remove vehicles from your fleet.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary !px-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span> Add New Vehicle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6">
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="border border-border bg-white rounded-md px-4 py-2.5 text-sm font-semibold text-dark outline-none focus:border-dark">
          <option>All Types</option><option>Hatchback</option><option>Sedan</option><option>SUV</option><option>Luxury</option><option>Bike</option><option>Scooter</option>
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border border-border bg-white rounded-md px-4 py-2.5 text-sm font-semibold text-dark outline-none focus:border-dark">
          <option>All Statuses</option><option>Available</option><option>Rented</option><option>Maintenance</option>
        </select>
        <span className="text-sm text-muted font-medium self-center ml-auto">{filteredCars.length} vehicle{filteredCars.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-off border-b border-border">
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Vehicle</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">License Plate</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map(car => (
                <tr key={car._id} className="border-b border-border last:border-0 hover:bg-off/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img src={car.images?.[0] || 'https://via.placeholder.com/60'} alt={car.make} className="w-14 h-14 rounded-md object-cover bg-off border border-border" />
                      <div>
                        <p className="font-bold text-dark">{car.make} {car.model}</p>
                        <p className="text-xs font-semibold text-muted mt-0.5">{car.year} • ₹{Number(car.pricePerDay).toLocaleString('en-IN')}/day</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-dark">{car.category}</td>
                  <td className="py-4 px-6 text-sm font-mono text-muted">{car.licensePlate}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[car.status] || 'bg-gray-100 text-gray-800'}`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEditModal(car)} className="text-dark hover:text-blue-600 font-semibold text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                      </button>
                      <button onClick={() => handleDelete(car._id, car.make, car.model)} className="text-muted hover:text-red-600 font-semibold text-sm flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr><td colSpan="5" className="py-12 text-center text-muted font-medium">No vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-lg)] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-display text-dark">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={handleCloseModal} className="text-muted hover:text-dark"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Make</label><input required className="w-full border border-border rounded p-2 text-sm" value={formData.make} onChange={e=>setFormData({...formData, make: e.target.value})}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Model</label><input required className="w-full border border-border rounded p-2 text-sm" value={formData.model} onChange={e=>setFormData({...formData, model: e.target.value})}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Year</label><input required type="number" className="w-full border border-border rounded p-2 text-sm" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Category</label>
                  <select className="w-full border border-border rounded p-2 text-sm" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                    <option>Hatchback</option><option>Sedan</option><option>SUV</option><option>Luxury</option><option>Bike</option><option>Scooter</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Price / Day</label><input required type="number" className="w-full border border-border rounded p-2 text-sm" value={formData.pricePerDay} onChange={e=>setFormData({...formData, pricePerDay: e.target.value})}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">License Plate</label><input required className="w-full border border-border rounded p-2 text-sm" value={formData.licensePlate} onChange={e=>setFormData({...formData, licensePlate: e.target.value})} readOnly={!!editingId}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Status</label>
                  <select className="w-full border border-border rounded p-2 text-sm" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                    <option>Available</option><option>Rented</option><option>Maintenance</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Image URL</label><input type="url" className="w-full border border-border rounded p-2 text-sm" value={formData.images[0]} onChange={e=>setFormData({...formData, images: [e.target.value]})}/></div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Transmission</label>
                  <select className="w-full border border-border rounded p-2 text-sm" value={formData.transmission} onChange={e=>setFormData({...formData, transmission: e.target.value})}>
                    <option>Automatic</option><option>Manual</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Fuel Type</label>
                  <select className="w-full border border-border rounded p-2 text-sm" value={formData.fuelType} onChange={e=>setFormData({...formData, fuelType: e.target.value})}>
                    <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Drive Option</label>
                  <select className="w-full border border-border rounded p-2 text-sm" value={formData.driveOption} onChange={e=>setFormData({...formData, driveOption: e.target.value})}>
                    <option>Self Drive</option><option>With Driver</option><option>Both</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Seats</label><input required type="number" className="w-full border border-border rounded p-2 text-sm" value={formData.seats} onChange={e=>setFormData({...formData, seats: e.target.value})}/></div>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">{editingId ? 'Update Vehicle' : 'Save Vehicle'}</button>
            </form>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default Fleet;
