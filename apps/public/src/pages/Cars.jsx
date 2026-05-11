import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/shared/CarCard';
import { carAPI } from '../services/api';
import {
  FilterIcon,
  XIcon,
  SearchIcon
} from '../components/ui/Icons';
import SidebarFilters from '../components/cars/SidebarFilters';
import CarGrid from '../components/cars/CarGrid';

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
    type: searchParams.get('type') ? searchParams.get('type').split(',').map(t => t.toLowerCase()) : [],
  }));
  const [committedFilters, setCommittedFilters] = useState(localFilters);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (committedFilters.type.length > 0) params.category = committedFilters.type.join(',');
      if (committedFilters.maxPrice) params.maxPrice = committedFilters.maxPrice;
      if (search.trim()) params.search = search.trim();
      const res = await carAPI.getAll(params);
      setCars(res.data.data || []);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load cars. Please try again.');
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, committedFilters, search]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const applyFilters = useCallback(() => {
    setCommittedFilters({ ...localFilters });
    setFilterOpen(false);
    setCurrentPage(1);
  }, [localFilters]);

  const clearFilters = useCallback(() => {
    setLocalFilters(EMPTY_FILTERS);
    setCommittedFilters(EMPTY_FILTERS);
    setSearch('');
    setCurrentPage(1);
  }, []);

  const toggleType = useCallback((type) => {
    const lowerType = type.toLowerCase();
    setLocalFilters((prev) => ({
      ...prev,
      type: prev.type.includes(lowerType) ? prev.type.filter((t) => t !== lowerType) : [...prev.type, lowerType],
    }));
  }, []);

  const sortedCars = [...cars];

  const hasActiveFilters =
    localFilters.type.length > 0 ||
    localFilters.transmission ||
    localFilters.fuelType ||
    localFilters.driveOption;

  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-10">

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
          <div className="fixed inset-0 bg-black/40 z-[80] lg:hidden" onClick={() => setFilterOpen(false)} aria-hidden="true" />
        )}

        <SidebarFilters 
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          clearFilters={clearFilters}
          applyFilters={applyFilters}
          toggleType={toggleType}
        />

        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark mb-1">Available Fleet in Junagadh</h1>
              <p className="text-sm text-muted font-medium">
                {totalCount} vehicle{totalCount !== 1 ? 's' : ''} · Self drive &amp; chauffeur vehicles ready to book
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
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
                  <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-dark">
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

          <CarGrid 
            loading={loading}
            error={error}
            paginatedCars={sortedCars}
            localFilters={localFilters}
            setCommittedFilters={setCommittedFilters}
            clearFilters={clearFilters}
            totalPages={Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
};

export default Cars;
