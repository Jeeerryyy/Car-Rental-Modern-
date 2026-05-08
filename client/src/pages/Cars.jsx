import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CarCard from '../components/ui/CarCard';
import {
  FilterIcon,
  XIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CarIcon,
  SearchIcon
} from '../components/ui/Icons';

const ITEMS_PER_PAGE = 9;

const EMPTY_FILTERS = {
  type: [],
  maxPrice: 10000,
  transmission: '',
  fuelType: '',
  driveOption: '',
};

const Cars = () => {
  const [searchParams] = useSearchParams();

  const [localFilters, setLocalFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    type: searchParams.get('type') ? [searchParams.get('type')] : [],
  }));
  const [committedFilters, setCommittedFilters] = useState(localFilters);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = `/cars?maxPrice=${committedFilters.maxPrice}&limit=60`;
        if (committedFilters.transmission) query += `&transmission=${committedFilters.transmission}`;
        if (committedFilters.fuelType)     query += `&fuelType=${committedFilters.fuelType}`;
        if (committedFilters.driveOption)  query += `&driveOption=${committedFilters.driveOption}`;

        const res = await api.get(query);
        let fetched = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

        if (committedFilters.type.length > 0) {
          fetched = fetched.filter((c) => committedFilters.type.includes(c.category));
        }

        if (!cancelled) {
          setCars(fetched);
          setCurrentPage(1);
        }
      } catch {
        if (!cancelled) setError('Failed to load vehicles. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCars();
    return () => { cancelled = true; };
  }, [committedFilters]);

  const applyFilters = useCallback(() => {
    setCommittedFilters({ ...localFilters });
    setFilterOpen(false);
  }, [localFilters]);

  const clearFilters = useCallback(() => {
    setLocalFilters(EMPTY_FILTERS);
    setCommittedFilters(EMPTY_FILTERS);
  }, []);

  const toggleType = useCallback((type) => {
    setLocalFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter((t) => t !== type) : [...prev.type, type],
    }));
  }, []);

  const sortedCars = [...cars]
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.make?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.fuelType?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':  return a.pricePerDay - b.pricePerDay;
        case 'price-desc': return b.pricePerDay - a.pricePerDay;
        case 'newest':     return b.year - a.year;
        case 'rating':     return (b.rating || 0) - (a.rating || 0);
        default:           return 0;
      }
    });

  const totalPages = Math.max(1, Math.ceil(sortedCars.length / ITEMS_PER_PAGE));
  const paginatedCars = sortedCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters =
    localFilters.type.length > 0 ||
    localFilters.transmission ||
    localFilters.fuelType ||
    localFilters.driveOption;

  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-10">

        {/* Mobile filter toggle */}
        <button
          className="lg:hidden flex items-center gap-2 bg-white border border-border rounded-md px-4 py-2.5 text-sm font-bold text-dark shadow-sm"
          onClick={() => setFilterOpen(true)}
        >
          <FilterIcon className="w-[18px] h-[18px]" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 bg-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {localFilters.type.length + (localFilters.transmission ? 1 : 0) + (localFilters.fuelType ? 1 : 0) + (localFilters.driveOption ? 1 : 0)}
            </span>
          )}
        </button>

        {filterOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
            onClick={() => setFilterOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Filters */}
        <aside
          className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-[300px] lg:w-[280px] z-[85] lg:z-auto flex-shrink-0 bg-white lg:bg-transparent transform transition-transform duration-300 lg:transform-none ${filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}
        >
          <div className="bg-white p-6 rounded-none lg:rounded-[var(--radius-md)] shadow-sm lg:border lg:border-border lg:sticky lg:top-[100px]">
            <h3 className="font-display text-xl font-bold text-dark mb-6 flex items-center justify-between">
              Filters
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-muted hover:text-dark uppercase tracking-wider"
                >
                  Clear
                </button>
                <button
                  className="lg:hidden text-muted hover:text-dark"
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </h3>

            {/* Price Range */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Max Price / Day</h4>
              <input
                type="range" min="500" max="10000" step="500"
                value={localFilters.maxPrice}
                onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                className="w-full accent-dark"
              />
              <div className="flex justify-between text-sm mt-2 font-medium">
                <span className="text-muted">₹500</span>
                <span className="text-dark">₹{Number(localFilters.maxPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Vehicle Type</h4>
              <div className="flex flex-col gap-3">
                {['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.type.includes(type) ? 'bg-dark border-dark' : 'border-border group-hover:border-dark bg-white'}`}
                    >
                      {localFilters.type.includes(type) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={localFilters.type.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <span className="text-sm text-dark font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Drive Option */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Drive Option</h4>
              <div className="flex flex-col gap-3">
                {['Self Drive', 'With Driver', 'Both'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio" name="driveOption"
                      className="accent-dark w-4 h-4"
                      checked={localFilters.driveOption === opt}
                      onChange={() => setLocalFilters((p) => ({ ...p, driveOption: opt }))}
                      onClick={() => localFilters.driveOption === opt && setLocalFilters((p) => ({ ...p, driveOption: '' }))}
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
                {['Automatic', 'Manual'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocalFilters((p) => ({ ...p, transmission: p.transmission === t ? '' : t }))}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${localFilters.transmission === t ? 'bg-white shadow-sm text-dark' : 'text-muted hover:text-dark'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Type */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-dark mb-4">Fuel Type</h4>
              <div className="flex flex-col gap-3">
                {['Petrol', 'Diesel', 'CNG', 'Electric'].map((fuel) => (
                  <label key={fuel} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio" name="fuelType"
                      className="accent-dark w-4 h-4"
                      checked={localFilters.fuelType === fuel}
                      onChange={() => setLocalFilters((p) => ({ ...p, fuelType: fuel }))}
                      onClick={() => localFilters.fuelType === fuel && setLocalFilters((p) => ({ ...p, fuelType: '' }))}
                    />
                    <span className="text-sm text-dark font-medium">{fuel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="w-full bg-dark text-white font-semibold py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark mb-1">Available Fleet in Junagadh</h1>
              <p className="text-sm text-muted font-medium">
                {sortedCars.length} vehicle{sortedCars.length !== 1 ? 's' : ''} · Self drive &amp; chauffeur vehicles ready to book
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search make, model…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-56 pl-9 pr-3 py-2 border border-border bg-white rounded-md text-sm font-medium text-dark outline-none focus:border-dark placeholder:text-muted/60 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-dark">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-sm font-bold text-dark uppercase tracking-wider hidden md:block">Sort:</span>
              <select
                className="border border-border bg-white rounded-md px-3 py-2 text-sm font-medium text-dark outline-none focus:border-dark"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[var(--radius-md)] overflow-hidden border border-border shadow-sm flex flex-col h-[400px]">
                  <div className="h-[220px] skeleton" />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-6 w-3/4 skeleton mb-2" />
                      <div className="h-4 w-1/2 skeleton mb-4" />
                    </div>
                    <div className="h-10 w-full skeleton mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-[var(--radius-lg)] p-12 text-center border border-red-100">
              <p className="text-red-500 font-bold mb-4">{error}</p>
              <button onClick={() => setCommittedFilters({ ...localFilters })} className="btn-outline">Retry</button>
            </div>
          ) : paginatedCars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCars.map((car) => (
                  <CarCard
                    key={car._id}
                    id={car._id}
                    name={`${car.make} ${car.model}`}
                    image={car.images?.[0] ?? null}
                    price={car.pricePerDay}
                    seats={car.seats}
                    transmission={car.transmission}
                    category={car.category}
                    fuelType={car.fuelType}
                    driveOption={car.driveOption}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-md border font-bold flex items-center justify-center transition-colors ${currentPage === page ? 'border-dark bg-dark text-white' : 'border-border bg-white text-dark hover:border-dark'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-[var(--radius-lg)] p-12 text-center border border-border">
              <CarIcon className="w-12 h-12 text-muted/30 mb-4 block mx-auto" />
              <h3 className="font-display text-2xl font-bold text-dark mb-2">No vehicles found</h3>
              <p className="text-muted mb-6">We couldn't find any cars matching your current filters.</p>
              <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Cars;
