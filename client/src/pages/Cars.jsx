import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import CarCard from '../components/ui/CarCard';

const ITEMS_PER_PAGE = 9;

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Pre-fill filters from URL
  const [filters, setFilters] = useState({
    type: searchParams.get('type') ? [searchParams.get('type')] : [],
    maxPrice: 10000,
    transmission: '',
    fuelType: '',
    driveOption: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        let query = `/api/cars?maxPrice=${filters.maxPrice}`;
        if (filters.transmission) query += `&transmission=${filters.transmission}`;
        if (filters.fuelType) query += `&fuelType=${filters.fuelType}`;
        if (filters.driveOption) query += `&driveOption=${filters.driveOption}`;
        
        const res = await api.get(query);
        let fetched = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (filters.type.length > 0) {
          fetched = fetched.filter(c => filters.type.includes(c.category));
        }
        
        setCars(fetched);
        setCurrentPage(1);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [filters]);

  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter(t => t !== type) : [...prev.type, type]
    }));
  };

  // Sort cars
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.pricePerDay - b.pricePerDay;
      case 'price-desc': return b.pricePerDay - a.pricePerDay;
      case 'newest': return b.year - a.year;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      default: return 0;
    }
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedCars.length / ITEMS_PER_PAGE));
  const paginatedCars = sortedCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-10">
        

        <button
          className="lg:hidden flex items-center gap-2 bg-white border border-border rounded-md px-4 py-2.5 text-sm font-bold text-dark shadow-sm"
          onClick={() => setFilterOpen(true)}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Filters
          {(filters.type.length > 0 || filters.transmission || filters.fuelType || filters.driveOption) && (
            <span className="ml-1 w-5 h-5 bg-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {filters.type.length + (filters.transmission ? 1 : 0) + (filters.fuelType ? 1 : 0) + (filters.driveOption ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Mobile Filter Backdrop */}
        {filterOpen && <div className="fixed inset-0 bg-black/40 z-[80] lg:hidden" onClick={() => setFilterOpen(false)} aria-hidden="true" />}

        {/* Left Sidebar — desktop inline, mobile drawer */}
        <aside className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-[300px] lg:w-[280px] z-[85] lg:z-auto flex-shrink-0 bg-white lg:bg-transparent transform transition-transform duration-300 lg:transform-none ${filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}>
          <div className="bg-white p-6 rounded-none lg:rounded-[var(--radius-md)] shadow-sm lg:border lg:border-border lg:sticky lg:top-[100px]">
            <h3 className="font-display text-xl font-bold text-dark mb-6 flex items-center justify-between">
              Filters
              <div className="flex items-center gap-3">
                <button onClick={() => setFilters({type: [], maxPrice: 10000, transmission: '', fuelType: '', driveOption: ''})} className="text-xs font-semibold text-muted hover:text-dark uppercase tracking-wider">Clear</button>
                <button className="lg:hidden text-muted hover:text-dark" onClick={() => setFilterOpen(false)} aria-label="Close filters"><span className="material-symbols-outlined">close</span></button>
              </div>
            </h3>
            
            {/* Price Range */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Max Price / Day</h4>
              <input 
                type="range" min="500" max="10000" step="500"
                value={filters.maxPrice} 
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full accent-dark"
              />
              <div className="flex justify-between text-sm mt-2 font-medium">
                <span className="text-muted">₹500</span>
                <span className="text-dark">₹{Number(filters.maxPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Vehicle Type</h4>
              <div className="flex flex-col gap-3">
                {['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.type.includes(type) ? 'bg-dark border-dark' : 'border-border group-hover:border-dark bg-white'}`}>
                      {filters.type.includes(type) && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <input type="checkbox" id={`filter-${type.toLowerCase()}`} className="sr-only" checked={filters.type.includes(type)} onChange={() => toggleType(type)} />
                    <span className="text-sm text-dark font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Drive Option */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Drive Option</h4>
              <div className="flex flex-col gap-3">
                {['Self Drive', 'With Driver', 'Both'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" name="driveOption" 
                      className="accent-dark w-4 h-4"
                      checked={filters.driveOption === opt}
                      onChange={() => setFilters({...filters, driveOption: opt})}
                      onClick={() => filters.driveOption === opt && setFilters({...filters, driveOption: ''})}
                    />
                    <span className="text-sm text-dark font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Transmission</h4>
              <div className="flex bg-off p-1 rounded-md border border-border">
                <button 
                  onClick={() => setFilters({...filters, transmission: filters.transmission === 'Automatic' ? '' : 'Automatic'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${filters.transmission === 'Automatic' ? 'bg-white shadow-sm text-dark' : 'text-muted hover:text-dark'}`}
                >Automatic</button>
                <button 
                  onClick={() => setFilters({...filters, transmission: filters.transmission === 'Manual' ? '' : 'Manual'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${filters.transmission === 'Manual' ? 'bg-white shadow-sm text-dark' : 'text-muted hover:text-dark'}`}
                >Manual</button>
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <h4 className="text-sm font-bold text-dark mb-4">Fuel Type</h4>
              <div className="flex flex-col gap-3">
                {['Petrol', 'Diesel', 'CNG', 'Electric'].map(fuel => (
                  <label key={fuel} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" name="fuelType" 
                      className="accent-dark w-4 h-4"
                      checked={filters.fuelType === fuel}
                      onChange={() => setFilters({...filters, fuelType: fuel})}
                      onClick={() => filters.fuelType === fuel && setFilters({...filters, fuelType: ''})}
                    />
                    <span className="text-sm text-dark font-medium">{fuel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile apply button */}
            <button className="lg:hidden w-full mt-6 bg-dark text-white font-semibold py-3 rounded-md" onClick={() => setFilterOpen(false)}>Apply Filters</button>
          </div>
        </aside>

        {/* Right Main Area */}
        <main className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark mb-1">Available Fleet in Junagadh</h1>
              <p className="text-sm text-muted font-medium">
                {cars.length} vehicle{cars.length !== 1 ? 's' : ''} · Self drive & chauffeur vehicles ready to book
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-dark uppercase tracking-wider">Sort By:</span>
              <select 
                className="border border-border bg-white rounded-md px-4 py-2 text-sm font-medium text-dark outline-none focus:border-dark"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : paginatedCars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCars.map(car => (
                  <CarCard 
                    key={car._id}
                    id={car._id}
                    make={car.make}
                    name={`${car.make} ${car.model}`}
                    image={car.images && car.images.length > 0 ? car.images[0] : null}
                    price={car.pricePerDay}
                    seats={car.seats}
                    transmission={car.transmission}
                    category={car.category}
                    fuelType={car.fuelType}
                    driveOption={car.driveOption}
                  />
                ))}
              </div>
              
              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-md border font-bold flex items-center justify-center transition-colors ${
                          currentPage === page
                            ? 'border-dark bg-dark text-white'
                            : 'border-border bg-white text-dark hover:border-dark'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
             <div className="bg-white rounded-[var(--radius-lg)] p-12 text-center border border-border">
              <span className="material-symbols-outlined text-4xl text-muted mb-4 block">no_crash</span>
              <h3 className="font-display text-2xl font-bold text-dark mb-2">No vehicles found</h3>
              <p className="text-muted">We couldn't find any cars matching your current filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Cars;
