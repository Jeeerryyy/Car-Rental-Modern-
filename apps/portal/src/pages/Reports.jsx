import { useState } from 'react';
import { getRevenueReport, getFleetReport, getBookingsReport, exportBookingsCSV } from '../api/reports';

const REPORT_TYPES = [
  { id: 'revenue', label: 'Revenue Report', icon: 'attach_money', description: 'Monthly revenue breakdown' },
  { id: 'fleet', label: 'Fleet Report', icon: 'directions_car', description: 'Vehicle utilization rates' },
  { id: 'bookings', label: 'Booking Report', icon: 'calendar_today', description: 'Booking trends and patterns' },
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchReport = async (id) => {
    setActiveReport(id);
    setLoading(true);
    setReportData(null);
    try {
      let res;
      if (id === 'revenue') res = await getRevenueReport({ startDate, endDate });
      if (id === 'fleet') res = await getFleetReport();
      if (id === 'bookings') res = await getBookingsReport({ startDate, endDate });
      setReportData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportBookingsCSV({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-primary">Reports & Analytics</h1>
          <p className="text-body-sm text-secondary mt-1">Fleet analytics and financial summaries</p>
        </div>
        
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant flex items-center gap-4">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-surface-container border-none rounded-lg px-3 py-2 text-sm" />
          <span className="text-secondary text-sm">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-surface-container border-none rounded-lg px-3 py-2 text-sm" />
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {REPORT_TYPES.map(({ id, label, icon, description }) => (
          <div 
            key={id} 
            onClick={() => fetchReport(id)}
            className={`rounded-xl border p-6 transition-colors cursor-pointer ${activeReport === id ? 'bg-primary-container border-primary' : 'bg-surface-container-lowest border-outline-variant hover:border-primary-container'}`}
          >
            <span className={`material-symbols-outlined text-3xl mb-3 block ${activeReport === id ? 'text-on-primary-container' : 'text-primary'}`}>{icon}</span>
            <h3 className={`font-bold mb-1 ${activeReport === id ? 'text-on-primary-container' : 'text-primary'}`}>{label}</h3>
            <p className={`text-body-sm ${activeReport === id ? 'text-on-primary-container/80' : 'text-secondary'}`}>{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 min-h-[300px]">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-container rounded w-1/4 mb-6" />
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl" />)}
          </div>
        ) : !reportData ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">insights</span>
            <p className="text-secondary">Select a report type to view data</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-primary mb-6 capitalize">{activeReport} Data</h3>
            <div className="space-y-3">
              {reportData.map((item, i) => (
                <div key={i} className="bg-surface-container rounded-xl p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">
                    {item._id?.month ? `${item._id.month}/${item._id.year}` : (item._id || 'Unknown')}
                  </span>
                  <div className="text-right">
                    <span className="block font-bold text-primary text-lg">
                      {item.totalRevenue ? `₹${item.totalRevenue.toLocaleString('en-IN')}` : item.count}
                    </span>
                    <span className="text-[10px] text-outline uppercase tracking-widest">
                      {item.totalRevenue ? `${item.count} Bookings` : 'Total'}
                    </span>
                  </div>
                </div>
              ))}
              {reportData.length === 0 && (
                <p className="text-center text-secondary py-8">No data found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
