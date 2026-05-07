import { useState, useEffect } from 'react';
import api from '../../services/api';
import syncManager from '../../services/syncManager';
import { PlusIcon, EditIcon, TrashIcon, MapIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', capacity: 0, layout: { rows: 5, cols: 5, blockedSeats: [] } });

  useEffect(() => { fetchVenues(); }, []);

  const fetchVenues = async () => {
    try {
      const res = await api.get('/api/event-admin/venues');
      setVenues(res.data);
    } catch (err) { toast.error('Failed to load venues'); }
  };

  const toggleSeatBlock = (row, col) => {
    const isBlocked = formData.layout.blockedSeats.some(s => s.row === row && s.col === col);
    const newBlocked = isBlocked 
      ? formData.layout.blockedSeats.filter(s => !(s.row === row && s.col === col))
      : [...formData.layout.blockedSeats, { row, col }];
    setFormData({ ...formData, layout: { ...formData.layout, blockedSeats: newBlocked } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentVenue) {
        await syncManager.performMutation('PUT', `/api/event-admin/venues/${currentVenue._id}`, formData);
        toast.success('Venue updated');
      } else {
        await syncManager.performMutation('POST', '/api/event-admin/venues', formData);
        toast.success('Venue created');
      }
      setIsModalOpen(false);
      fetchVenues();
    } catch (err) { toast.error('Save failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Venue Management</h1>
        <button onClick={() => { setCurrentVenue(null); setFormData({ name: '', location: '', capacity: 0, layout: { rows: 5, cols: 5, blockedSeats: [] } }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map(venue => (
          <div key={venue._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{venue.name}</h3>
                <p className="text-sm text-gray-500">{venue.location}</p>
              </div>
              <MapIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs font-medium">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Cap: {venue.capacity}</span>
              <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">Grid: {venue.layout?.rows}x{venue.layout?.cols}</span>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button onClick={() => { setCurrentVenue(venue); setFormData(venue); setIsModalOpen(true); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><EditIcon className="w-4 h-4" /></button>
              <button className="text-red-600 p-1 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{currentVenue ? 'Edit Venue' : 'New Venue'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Venue Name</label>
                  <input required className="w-full mt-1 border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input required className="w-full mt-1 border rounded-lg p-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Seating Layout Grid</p>
                <div className="flex gap-4 mb-4">
                  <input type="number" placeholder="Rows" className="w-20 border rounded p-1 text-sm" value={formData.layout.rows} onChange={e => setFormData({...formData, layout: { ...formData.layout, rows: parseInt(e.target.value) }})} />
                  <input type="number" placeholder="Cols" className="w-20 border rounded p-1 text-sm" value={formData.layout.cols} onChange={e => setFormData({...formData, layout: { ...formData.layout, cols: parseInt(e.target.value) }})} />
                </div>
                
                <div className="inline-grid gap-1 bg-gray-100 p-2 rounded-lg border max-h-[300px] overflow-auto" style={{ gridTemplateColumns: `repeat(${formData.layout.cols}, minmax(0, 1fr))` }}>
                  {Array.from({ length: formData.layout.rows * formData.layout.cols }).map((_, i) => {
                    const row = Math.floor(i / formData.layout.cols);
                    const col = i % formData.layout.cols;
                    const isBlocked = formData.layout.blockedSeats.some(s => s.row === row && s.col === col);
                    return (
                      <button 
                        key={i} type="button" onClick={() => toggleSeatBlock(row, col)}
                        className={`w-6 h-6 rounded ${isBlocked ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80`}
                        title={`Row ${row}, Col ${col}`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Click squares to toggle between available (green) and blocked/unavailable (red).</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Save Venue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueManagement;
