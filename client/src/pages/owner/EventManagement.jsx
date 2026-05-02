import { useState, useEffect } from 'react';
import api from '../../services/api';
import syncManager from '../../services/syncManager';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', venue: '', status: 'Draft' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, venuesRes] = await Promise.all([
        api.get('/api/event-admin/events'),
        api.get('/api/event-admin/venues')
      ]);
      setEvents(eventsRes.data);
      setVenues(venuesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        await syncManager.performMutation('PUT', `/api/event-admin/events/${currentEvent._id}`, formData);
        toast.success('Event updated');
      } else {
        await syncManager.performMutation('POST', '/api/event-admin/events', formData);
        toast.success('Event created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await syncManager.performMutation('DELETE', `/api/event-admin/events/${id}`);
      toast.success('Event deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Management</h1>
        <button 
          onClick={() => { setCurrentEvent(null); setFormData({ title: '', description: '', category: '', venue: '', status: 'Draft' }); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Event</th>
              <th className="px-6 py-3 text-left">Venue</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map(event => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                <td className="px-6 py-4 text-gray-600">{event.venue?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{event.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${event.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => { setCurrentEvent(event); setFormData({ title: event.title, description: event.description, category: event.category, venue: event.venue?._id, status: event.status }); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4" /></button>
                  <button onClick={() => deleteEvent(event._id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{currentEvent ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required className="w-full mt-1 border border-gray-300 rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue</label>
                <select required className="w-full mt-1 border border-gray-300 rounded-lg p-2" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}>
                  <option value="">Select Venue</option>
                  {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input className="w-full mt-1 border border-gray-300 rounded-lg p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="w-full mt-1 border border-gray-300 rounded-lg p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
