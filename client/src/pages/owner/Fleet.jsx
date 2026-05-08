import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get('/cars');
        if (res.success) {
          setVehicles(res.data.cars);
        }
      } catch (err) {
        toast.error('Failed to load fleet inventory');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  const statusColor = (s) => {
    if (s === 'Available') return 'bg-primary text-on-primary';
    if (s === 'Rented') return 'bg-primary text-on-primary';
    if (s === 'Maintenance') return 'bg-error text-on-error';
    return 'bg-surface-variant text-primary';
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAvailable = vehicles.filter(v => v.status === 'Available').length;
  const totalRented = vehicles.filter(v => v.status === 'Rented').length;
  const totalMaintenance = vehicles.filter(v => v.status === 'Maintenance').length;

  return (
    <div className="flex-1 px-4 md:px-12 py-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Vehicle Inventory</h2>
          <p className="font-body-md text-body-md text-secondary">Manage your active fleet, check availability, and update vehicle records.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/owner/add-car" className="bg-primary-container text-on-primary font-body-md text-body-md rounded-full px-6 py-2.5 hover:bg-primary transition-colors flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">add</span> Add Vehicle
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-4 border-b border-outline-variant">
        <div className="flex gap-6 overflow-x-auto w-full pb-2 md:pb-0">
          {[
            { label: 'Total Fleet', value: vehicles.length },
            { label: 'Available', value: totalAvailable },
            { label: 'On Rent', value: totalRented },
            { label: 'Maintenance', value: totalMaintenance },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col min-w-[120px]">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">{stat.label}</span>
              <span className="font-headline-lg text-headline-lg text-primary">{isLoading ? '-' : stat.value}</span>
            </div>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-primary focus:border-primary-container focus:ring-0 focus:outline-none transition-colors"
            placeholder="Search vehicles..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-secondary">directions_car</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">
            {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No vehicles match "${searchTerm}". Try a different search.`
              : 'Add your first vehicle to start managing your fleet.'
            }
          </p>
          {searchTerm ? (
            <button onClick={() => setSearchTerm('')} className="btn-outline">
              Clear Search
            </button>
          ) : (
            <Link to="/owner/add-car" className="btn-primary inline-flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Add Your First Vehicle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Featured Card (First Vehicle) */}
          {filteredVehicles.length > 0 && (
            <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col group hover:border-primary-container transition-colors">
              <div className="relative h-64 md:h-80 w-full bg-secondary overflow-hidden">
                {filteredVehicles[0].images?.[0]?.url ? (
                  <img src={filteredVehicles[0].images[0].url} alt={filteredVehicles[0].model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-variant">
                    <span className="material-symbols-outlined text-on-surface-variant text-6xl">directions_car</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <div className="absolute top-4 right-4 z-20">
                  <span className={`${statusColor(filteredVehicles[0].status)} font-label-caps text-label-caps px-3 py-1 rounded-full uppercase tracking-widest`}>{filteredVehicles[0].status}</span>
                </div>
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h3 className="font-headline-lg text-headline-lg mb-1">{filteredVehicles[0].make} {filteredVehicles[0].model}</h3>
                  <p className="font-body-sm text-body-sm opacity-90">{filteredVehicles[0].category} · {filteredVehicles[0].year}</p>
                </div>
              </div>
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest">
                <div className="flex gap-8 flex-wrap">
                  <div>
                    <span className="block font-label-caps text-label-caps text-secondary mb-1">Daily Rate</span>
                    <span className="font-data-tabular text-data-tabular text-primary">{formatCurrency(filteredVehicles[0].pricePerDay)}</span>
                  </div>
                  <div>
                    <span className="block font-label-caps text-label-caps text-secondary mb-1">Plate</span>
                    <span className="font-data-tabular text-data-tabular text-primary">{filteredVehicles[0].licensePlate}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block font-label-caps text-label-caps text-secondary mb-1">Location</span>
                    <span className="font-data-tabular text-data-tabular text-primary">{filteredVehicles[0].location || 'Depot'}</span>
                  </div>
                </div>
                <Link to={`/owner/fleet/${filteredVehicles[0]._id}`} className="bg-transparent border border-primary-container text-primary-container text-center font-body-md text-body-md rounded-full px-6 py-2 hover:bg-surface-container transition-colors w-full md:w-auto">Manage</Link>
              </div>
            </div>
          )}

          {/* Standard Cards */}
          {filteredVehicles.slice(1).map((v) => (
            <div key={v._id} className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col group hover:border-primary-container transition-colors">
              <div className="relative h-48 w-full bg-secondary overflow-hidden">
                {v.images?.[0]?.url ? (
                  <img src={v.images[0].url} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-variant">
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl">directions_car</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className="absolute top-4 right-4 z-20">
                  <span className={`${statusColor(v.status)} font-label-caps text-label-caps px-3 py-1 rounded-full uppercase tracking-widest`}>{v.status}</span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col bg-surface-container-lowest">
                <h3 className="font-body-md text-body-md font-medium text-primary mb-1">{v.make} {v.model}</h3>
                <p className="font-body-sm text-body-sm text-secondary mb-4 pb-4 border-b border-outline-variant">{v.category} · {v.year}</p>
                <div className="flex justify-between mb-4">
                  <div>
                    <span className="block font-label-caps text-label-caps text-secondary mb-1">Rate</span>
                    <span className="font-data-tabular text-data-tabular text-primary">{formatCurrency(v.pricePerDay)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-label-caps text-label-caps text-secondary mb-1">Plate</span>
                    <span className="font-data-tabular text-data-tabular text-primary">{v.licensePlate}</span>
                  </div>
                </div>
                <div className="mt-auto pt-2">
                  <Link to={`/owner/fleet/${v._id}`} className="w-full block text-center bg-transparent border border-primary-container text-primary-container font-body-md text-body-md rounded-full py-2 hover:bg-surface-container transition-colors">Manage</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
