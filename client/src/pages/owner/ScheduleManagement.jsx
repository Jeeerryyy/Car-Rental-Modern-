import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusIcon, CalendarIcon, ClockIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ event: '', startTime: '', pricing: [{ tier: 'Standard', price: 0 }] });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [schedRes, eventRes] = await Promise.all([
        api.get('/api/event-admin/schedules'),
        api.get('/api/event-admin/events')
      ]);
      setSchedules(schedRes.data);
      setEvents(eventRes.data);
    } catch (err) { toast.error('Load failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/event-admin/schedules', formData);
      toast.success('Schedule added');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Save failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Show Schedules</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Show
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Event</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Pricing</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedules.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.event?.title}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> {new Date(s.startTime).toLocaleDateString()}
                    <ClockIcon className="w-3 h-3 ml-2" /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-bit', minute: '2-bit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {s.pricing.map(p => <span key={p.tier} className="text-xs mr-2 border rounded px-1">{p.tier}: ₹{p.price}</span>)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Schedule New Show</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event</label>
                <select required className="w-full mt-1 border rounded-lg p-2" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})}>
                  <option value="">Select Event</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input type="datetime-local" required className="w-full mt-1 border rounded-lg p-2" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Base Price (Standard Tier)</label>
                <input type="number" required className="w-full mt-1 border rounded-lg p-2" value={formData.pricing[0].price} onChange={e => setFormData({...formData, pricing: [{ tier: 'Standard', price: parseFloat(e.target.value) }]})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Add Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
