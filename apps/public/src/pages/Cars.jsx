import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/shared/CarCard';
import { carAPI } from '../services/api';
import { FilterIcon, XIcon, SearchIcon } from '../components/ui/Icons';
import SidebarFilters from '../components/cars/SidebarFilters';
import CarGrid from '../components/cars/CarGrid';
import SEO from '../components/SEO';
import { getSocket } from '../lib/socket.js';
import { SOCKET_EVENTS } from '../lib/socket.events.js';

const ITEMS_PER_PAGE = 100;
const EMPTY_FILTERS = { type: [], maxPrice: 10000, transmission: '', fuelType: '', driveOption: '' };

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
  const [quickType, setQuickType] = useState('');

  const fetchCars = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (quickType) params.type = quickType;
      if (committedFilters.type.length > 0) params.category = committedFilters.type.join(',');
      if (committedFilters.fuelType) params.fuelType = committedFilters.fuelType;
      if (committedFilters.transmission) params.transmission = committedFilters.transmission;
      if (committedFilters.maxPrice) params.maxPrice = committedFilters.maxPrice;
      if (search.trim()) params.search = search.trim();
      
      const startDate = searchParams.get('startDate') || searchParams.get('from');
      const endDate = searchParams.get('endDate') || searchParams.get('to');
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await carAPI.getAll(params);
      setCars(res.data.data || []);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load cars. Please try again.'); setCars([]);
    } finally { setLoading(false); }
  }, [currentPage, committedFilters, search, quickType, searchParams]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleAvailability = () => {
      fetchCars();
    };

    socket.on(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, handleAvailability);
    return () => {
      socket.off(SOCKET_EVENTS.CAR_AVAILABILITY_CHANGED, handleAvailability);
    };
  }, [fetchCars]);

  const applyFilters = useCallback(() => { setCommittedFilters({ ...localFilters }); setFilterOpen(false); setCurrentPage(1); }, [localFilters]);
  const clearFilters = useCallback(() => { setLocalFilters(EMPTY_FILTERS); setCommittedFilters(EMPTY_FILTERS); setSearch(''); setCurrentPage(1); }, []);
  const toggleType = useCallback((type) => {
    const lowerType = type.toLowerCase();
    setLocalFilters((prev) => ({ ...prev, type: prev.type.includes(lowerType) ? prev.type.filter((t) => t !== lowerType) : [...prev.type, lowerType] }));
  }, []);

  const sortedCars = [...cars];
  const hasActiveFilters = localFilters.type.length > 0 || localFilters.transmission || localFilters.fuelType || localFilters.driveOption;

  const quickBtnStyle = (active) => ({
    background: active ? '#141414' : '#E7E0D4',
    color: active ? '#F8F6F1' : '#121212',
    border: active ? '1px solid #141414' : '1px solid #D6D0C7',
  });

  return (
    <div className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
      <SEO 
        title="Our Fleet: Rent Self Drive Cars & Bikes | Modern Selfdrive"
        description="Explore our wide range of rental cars, SUVs, and bikes in Junagadh, Gujarat. Hatchbacks, sedans, 4WD SUVs, and standard bikes available with flexible same-day rental options."
        keywords={['rental fleet gujarat', 'rent automatic SUV', 'hatchback rental gujarat', 'self drive bikes junagadh', 'hire Thar in Gujarat', 'rent Ertiga gujarat']}
        canonical={window.location.origin + '/cars'}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-10">
        <button className="lg:hidden flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold transition-colors duration-200 hover:bg-[#A56A43]"
          style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' }}
          onClick={() => setFilterOpen(true)}>
          <FilterIcon className="w-[18px] h-[18px]" /> Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center"
              style={{ background: '#141414', color: '#F8F6F1' }}>
              {localFilters.type.length + (localFilters.transmission ? 1 : 0) + (localFilters.fuelType ? 1 : 0) + (localFilters.driveOption ? 1 : 0)}
            </span>
          )}
        </button>

        {filterOpen && (<div className="fixed inset-0 z-[80] lg:hidden" style={{ background: 'rgba(18,18,18,0.35)' }} onClick={() => setFilterOpen(false)} aria-hidden="true" />)}

        <SidebarFilters filterOpen={filterOpen} setFilterOpen={setFilterOpen} localFilters={localFilters} setLocalFilters={setLocalFilters} clearFilters={clearFilters} applyFilters={applyFilters} toggleType={toggleType} />

        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#121212' }}>Available Fleet in Junagadh</h1>
              <p className="text-sm font-medium mb-3" style={{ color: '#5C5C5C' }}>{totalCount} vehicle{totalCount !== 1 ? 's' : ''} · Self drive &amp; chauffeur vehicles ready to book</p>
              <div className="flex gap-2">
                <button onClick={() => { setQuickType(''); setCurrentPage(1); }} className="px-4 py-1.5 rounded-full text-sm font-bold" style={quickBtnStyle(!quickType)}>All</button>
                <button onClick={() => { setQuickType('car'); setCurrentPage(1); }} className="px-4 py-1.5 rounded-full text-sm font-bold" style={quickBtnStyle(quickType === 'car')}>Cars</button>
                <button onClick={() => { setQuickType('bike'); setCurrentPage(1); }} className="px-4 py-1.5 rounded-full text-sm font-bold" style={quickBtnStyle(quickType === 'bike')}>Bikes</button>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5C5C5C' }} />
                <input type="text" placeholder="Search make, model…" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-56 pl-9 pr-3 py-2 rounded-btn text-sm font-medium outline-none"
                  style={{ background: '#F8F6F1', color: '#121212', border: '1px solid #D6D0C7' }} />
                {search && (<button onClick={() => { setSearch(''); setCurrentPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: '#5C5C5C' }}><XIcon className="w-3.5 h-3.5" /></button>)}
              </div>
              <span className="text-sm font-bold uppercase tracking-wider hidden md:block" style={{ color: '#121212' }}>Sort:</span>
              <select className="rounded-btn px-3 py-2 text-sm font-medium outline-none" style={{ background: '#F8F6F1', color: '#121212', border: '1px solid #D6D0C7' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          <CarGrid loading={loading} error={error} paginatedCars={sortedCars} localFilters={localFilters} setCommittedFilters={setCommittedFilters} clearFilters={clearFilters} totalPages={Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </main>
      </div>
    </div>
  );
};

export default Cars;
