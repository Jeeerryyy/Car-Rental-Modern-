import { useState } from 'react';

export default function BookingCalendar({ bookings = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Extract dates that have bookings
  const bookingDates = bookings.reduce((acc, b) => {
    if (!b.startDate) return acc;
    const date = new Date(b.startDate);
    if (date.getFullYear() === year && date.getMonth() === month) {
      acc.add(date.getDate());
    }
    // Also check endDate if it spans multiple days
    if (b.endDate) {
      const end = new Date(b.endDate);
      let curr = new Date(date);
      while (curr <= end) {
        if (curr.getFullYear() === year && curr.getMonth() === month) {
          acc.add(curr.getDate());
        }
        curr.setDate(curr.getDate() + 1);
      }
    }
    return acc;
  }, new Set());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const hasBooking = bookingDates.has(d);
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    
    days.push(
      <div key={d} className="h-10 w-full flex flex-col items-center justify-center relative group cursor-pointer hover:bg-off rounded-lg transition-colors">
        <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-dark'}`}>{d}</span>
        {hasBooking && (
          <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border p-6 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Availability Map</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-off rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-off rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg font-black text-dark tracking-tight">{monthName} <span className="text-muted/40 font-medium">{year}</span></p>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-[9px] font-black text-muted/50 tracking-widest uppercase">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center flex-1">
        {days}
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Booked Days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Today</span>
        </div>
      </div>
    </div>
  );
}
