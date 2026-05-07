import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  PlusIcon, EditIcon, TrashIcon, 
  SearchIcon, ActivityIcon, SettingsIcon
} from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';
import socket from '../../services/socket';

const OwnerFleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => { 
    fetchCars(); 

    const handleUpdate = () => {
      fetchCars();
    };

    socket.on('car-created', handleUpdate);
    socket.on('car-updated', handleUpdate);
    socket.on('car-deleted', handleUpdate);

    return () => {
      socket.off('car-created', handleUpdate);
      socket.off('car-updated', handleUpdate);
      socket.off('car-deleted', handleUpdate);
    };
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/cars');
      setCars(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      toast.error('Failed to load fleet data'); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleStatus = async (carId, newStatus) => {
    try {
      await api.patch(`/api/admin/cars/${carId}`, { status: newStatus });
      toast.success(`Vehicle set to ${newStatus}`);
      fetchCars();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm('IRREVERSIBLE ACTION: Are you sure you want to decommission this vehicle?')) return;
    try {
      await api.delete(`/api/admin/cars/${id}`);
      toast.success('Vehicle purged from system');
      fetchCars();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Delete failed'); 
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = `${car.make} ${car.model} ${car.licensePlate}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Fleet Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Fleet Manager</h1>
          <p className="text-sm text-gray-500 font-medium">Configure vehicle specifications, pricing, and operational availability.</p>
        </div>
        <button 
          onClick={() => navigate('/owner/fleet/new')} 
          className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200"
        >
          <PlusIcon className="w-4 h-4" /> Register Vehicle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-gray-100 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search make, model or plate..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600/10 transition-all outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'SUV', 'Sedan', 'Luxury', 'Bike'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-6 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                categoryFilter === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {filteredCars.map(car => (
          <div key={car._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
            <div className="aspect-[16/10] relative overflow-hidden bg-gray-50">
              <img 
                src={car.images?.[0] || 'https://via.placeholder.com/600x400?text=Vehicle+Coming+Soon'} 
                alt={car.make} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-sm backdrop-blur-md ${
                  car.status === 'Available' ? 'bg-white/90 text-green-600' : 
                  car.status === 'Rented' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {car.status?.toUpperCase()}
                </span>
                <span className="bg-black/80 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm backdrop-blur-md uppercase tracking-widest">
                  {car.category}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{car.make} {car.model}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 uppercase tracking-widest">{car.licensePlate}</span>
                    <span className="text-[10px] font-bold text-gray-400">{car.year} Edition</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">₹{car.pricePerDay}</p>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em]">Day Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Fuel</p>
                  <p className="text-xs font-bold text-gray-800">{car.fuelType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Gear</p>
                  <p className="text-xs font-bold text-gray-800">{car.transmission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Drive</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{car.driveOption}</p>
                </div>
              </div>

              <div className="mt-auto pt-8 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/owner/fleet/${car._id}`)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                    title="Edit vehicle details"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteCar(car._id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                    title="Decommission vehicle"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(car._id, car.status === 'Available' ? 'Maintenance' : 'Available')}
                    className={`px-5 py-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all border ${
                      car.status === 'Maintenance' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'
                    }`}
                  >
                    {car.status === 'Maintenance' ? 'UNDER REPAIR' : 'MAINTENANCE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerFleet;