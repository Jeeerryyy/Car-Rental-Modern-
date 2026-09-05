import { useState, useEffect } from 'react';
import { getBookings } from '../api/bookings.js';
import { getCars } from '../api/cars.js';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socket = useSocket();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#vehicle-select-dropdown')) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    getCars({ page: 1, limit: 100 })
      .then(res => {
        setCars(res.data?.data || res.data?.cars || []);
      })
      .catch(err => {
        console.error('Failed to fetch cars:', err);
      });
  }, []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getBookings({ limit: 500 });
      setBookings(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [month, year]);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchBookings();
      };

      socket.on('booking:created', handleUpdate);
      socket.on('booking:status_updated', handleUpdate);
      socket.on('booking:cancelled', handleUpdate);

      return () => {
        socket.off('booking:created');
        socket.off('booking:status_updated');
        socket.off('booking:cancelled');
      };
    }
  }, [socket]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const formatUTCDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getBookingsForDate = (day) => {
    const targetDateUTC = Date.UTC(year, month, day);

    return bookings.filter(b => {
      if (selectedCarId !== 'all' && b.car?._id !== selectedCarId) {
        return false;
      }
      if (!b.startDate || !b.endDate) {
        return false;
      }
      const startDateObj = new Date(b.startDate);
      const startUTC = Date.UTC(
        startDateObj.getUTCFullYear(),
        startDateObj.getUTCMonth(),
        startDateObj.getUTCDate()
      );
      const endDateObj = new Date(b.endDate);
      const endUTC = Date.UTC(
        endDateObj.getUTCFullYear(),
        endDateObj.getUTCMonth(),
        endDateObj.getUTCDate()
      );
      
      return targetDateUTC >= startUTC && targetDateUTC <= endUTC;
    });
  };

  const handleDateClick = (day) => {
    const bookingsForDate = getBookingsForDate(day);
    setSelectedDate({
      day,
      month: monthNames[month],
      year,
      bookings: bookingsForDate
    });
    setSidePanelOpen(true);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const filteredCars = cars.filter(c => {
    const searchStr = `${c.make} ${c.model} ${c.registrationNumber || ''} ${c.type}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  const calendarDays = [];
  // Padding for first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-16 sm:h-32 border-b border-r border-outline-variant bg-surface-container-lowest/50" />);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const bookingsForDate = getBookingsForDate(day);
    const hasBookings = bookingsForDate.length > 0;

    calendarDays.push(
      <div 
        key={day} 
        onClick={() => handleDateClick(day)}
        className={`h-16 sm:h-32 border-b border-r border-outline-variant p-1 sm:p-2 cursor-pointer transition-colors relative group ${hasBookings ? 'bg-red-50/75 border-l-2 border-red-500 hover:bg-red-100/50' : isToday(day) ? 'bg-primary-container/10 hover:bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}
      >
        <span className={`text-[10px] sm:text-sm font-bold ${isToday(day) ? 'bg-primary text-white w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full' : 'text-secondary'}`}>
          {day}
        </span>
        
        {hasBookings && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">{bookingsForDate.length} Booked</span>
            </div>
            <div className="hidden sm:block">
              {bookingsForDate.slice(0, 2).map((b, idx) => (
                <p key={idx} className="text-[8px] text-red-700 truncate font-semibold bg-red-50/50 px-1 rounded mb-0.5 border-l-2 border-red-500">
                  {b.car?.make} {b.car?.model}
                </p>
              ))}
              {bookingsForDate.length > 2 && <p className="text-[8px] text-red-600 font-bold">+{bookingsForDate.length - 2} more</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      <div className="flex flex-col h-full bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-outline-variant bg-surface-container-lowest gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary font-headline-md">{monthNames[month]} {year}</h2>
            <p className="text-secondary text-sm font-body-md mt-1">Fleet schedule for offline & online bookings</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Vehicle Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Vehicle:</span>
              <div id="vehicle-select-dropdown" className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between px-4 py-2 border border-outline-variant rounded-xl text-xs bg-surface outline-none focus:border-primary cursor-pointer font-semibold text-primary min-w-[220px] max-w-[320px] text-left"
                >
                  <span className="truncate">
                    {selectedCarId === 'all' 
                      ? 'All Vehicles (Cars & Bikes)' 
                      : (() => {
                          const currentCar = (cars || []).find(c => c?._id === selectedCarId);
                          return currentCar 
                            ? `${currentCar.make} ${currentCar.model} - ${currentCar.registrationNumber || 'No Plate'}` 
                            : 'Select Vehicle';
                        })()
                    }
                  </span>
                  <span className="material-symbols-outlined text-sm ml-2">expand_more</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden min-w-[250px] max-w-[320px] w-full">
                    <div className="p-2 border-b border-outline-variant flex items-center gap-2 bg-surface">
                      <span className="material-symbols-outlined text-sm text-secondary pl-1">search</span>
                      <input
                        type="text"
                        placeholder="Search vehicle..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent outline-none text-xs text-primary placeholder-secondary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCarId('all');
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${selectedCarId === 'all' ? 'bg-primary text-white' : 'text-primary hover:bg-surface-container-low'}`}
                      >
                        All Vehicles (Cars & Bikes)
                      </button>
                      {filteredCars.length > 0 ? (
                        filteredCars.filter(Boolean).map(c => (
                          <button
                            key={c?._id || Math.random()}
                            type="button"
                            onClick={() => {
                              setSelectedCarId(c?._id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors truncate ${selectedCarId === c?._id ? 'bg-primary text-white' : 'text-primary hover:bg-surface-container-low'}`}
                          >
                            {c?.make} {c?.model} - {c?.registrationNumber || 'No Plate'} ({c?.type})
                          </button>
                        ))
                      ) : (
                        <p className="text-[10px] text-center text-secondary py-4">No matching vehicles</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />}
              <button onClick={prevMonth} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-primary hover:bg-surface-container rounded-lg transition-colors border border-outline-variant">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-black text-secondary uppercase tracking-widest border-r border-outline-variant last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-7 overflow-y-auto min-h-[400px]">
          {calendarDays}
        </div>

        {/* Side Panel Overlay */}
        {sidePanelOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidePanelOpen(false)} />
            <div className="relative w-full md:max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300">
              <div className="px-6 py-4 md:px-8 md:py-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-bold text-primary">Bookings for {selectedDate?.day} {selectedDate?.month}</h3>
                  <p className="text-secondary text-sm mt-1">{selectedDate?.bookings.length} reservations found</p>
                </div>
                <button onClick={() => setSidePanelOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {selectedDate?.bookings.length > 0 ? (
                  selectedDate.bookings.map((b, idx) => (
                    <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant hover:border-primary/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary overflow-hidden flex items-center justify-center font-bold text-xl">
                          {b.car?.images?.[0]?.url ? (
                            <img src={b.car.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{b.car?.make?.[0] || 'C'}</span>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                          {b.status}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-primary mb-1">{b.car?.make} {b.car?.model}</h4>
                      <p className="text-secondary font-medium mb-4">{b.customer?.name || 'Walk-in Customer'}</p>
                      
                      <div className="grid grid-cols-1 gap-3 pt-4 border-t border-outline-variant">
                        <div className="flex items-center gap-3 text-sm text-secondary">
                          <span className="material-symbols-outlined text-[18px]">call</span>
                          <span className="font-bold">{b.phone || b.customer?.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-secondary">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                          <span className="truncate">{b.customer?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-secondary">
                          <span className="material-symbols-outlined text-[18px]">date_range</span>
                          <span>{formatUTCDate(b.startDate)} - {formatUTCDate(b.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-secondary">
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          <span className="font-bold text-primary">₹{Number(b.totalPrice).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                    <span className="material-symbols-outlined text-[64px] mb-4">calendar_today</span>
                    <p className="text-lg font-bold">No bookings for this date</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-outline-variant bg-surface-container-low">
                <button onClick={() => setSidePanelOpen(false)} className="w-full py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
