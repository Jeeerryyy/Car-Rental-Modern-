import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars, deleteCar, toggleCarAvailability } from '../api/cars.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['sedan', 'suv', 'luxury', 'sports', 'van'];

export default function Fleet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const res = await getCars(params);
      setCars(res.data.data || []);
    } catch {
      toast.error('Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, [filter, page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this car? This action cannot be undone.')) return;
    try {
      await deleteCar(id);
      toast.success('Car deleted');
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCarAvailability(id);
      toast.success('Availability updated');
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = cars.filter(c =>
    !search || `${c.make} ${c.model} ${c.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Fleet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{filtered.length} vehicles in your fleet</p>
        </div>
        <Link to="/fleet/add" className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-caps text-label-caps flex justify-center items-center gap-2 hover:bg-surface-tint transition-colors whitespace-nowrap">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          Add New Car
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search make, model, category…"
          className="flex-1 px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary" />
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <p className="text-on-surface-variant mb-4">No vehicles in fleet</p>
          <Link to="/fleet/add" className="btn-primary inline-block">Add Your First Car</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(car => (
            <div key={car._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-full sm:w-24 h-40 sm:h-20 bg-surface rounded-xl overflow-hidden flex-shrink-0">
                <img src={car.images?.[0]?.url || '/no-car.png'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <p className="font-bold text-lg text-on-surface truncate">{car.make} {car.model}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${car.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {car.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant capitalize">{car.category} · {car.year} · {car.location}</p>
                <p className="font-black text-primary mt-1 sm:hidden text-lg">₹{Number(car.pricePerDay).toLocaleString('en-IN')}/day</p>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="font-black text-xl text-on-surface">₹{Number(car.pricePerDay).toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">per day</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-outline-variant">
                <Link to={`/fleet/${car._id}`} className="flex-1 sm:flex-none text-center px-4 py-2.5 text-xs font-bold bg-surface-container-high rounded-xl hover:bg-surface-tint transition-colors">Edit</Link>
                <button onClick={() => handleToggle(car._id)} className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold bg-surface-container-high rounded-xl hover:bg-surface-tint transition-colors">
                  {car.isActive ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(car._id)} className="px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
