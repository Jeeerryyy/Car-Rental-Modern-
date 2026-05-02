import { useState, useEffect } from 'react';
import api from '../../services/api';
import { SearchIcon, UserIcon, PhoneIcon, MailIcon, XIcon, UsersIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings')
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      const bookData = bookingsRes.data?.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setBookings(bookData);
    } catch (err) {
      toast.error('Failed to load customer directory');
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = (userId) => {
    if (!userId || !Array.isArray(bookings)) return [];
    return bookings.filter(b => b.userId?._id === userId || b.userId === userId);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || (u.phone || '').includes(search);
  }) : [];

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Accessing Customer Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Customer Directory</h1>
        <p className="text-sm text-gray-500">Manage registered users and view their rental history.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm min-w-[140px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registered</p>
            <p className="text-2xl font-black text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm min-w-[140px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Returning Clients</p>
            <p className="text-2xl font-black text-blue-600">{users.filter(u => getUserBookings(u._id).length > 1).length}</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-left">Customer</th>
                <th className="px-6 py-5 text-left">Contact Information</th>
                <th className="px-6 py-5 text-left">Activity</th>
                <th className="px-6 py-5 text-left">Lifetime Value</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => {
                const uBookings = getUserBookings(user._id);
                const spent = uBookings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                return (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900">{user.name || 'Anonymous User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MailIcon className="w-3 h-3 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <PhoneIcon className="w-3 h-3 text-gray-400" />
                          {user.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${uBookings.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                          {uBookings.length} BOOKINGS
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-gray-900">{formatCurrency(spent)}</td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => setSelectedUser(user)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <UsersIcon className="w-12 h-12 text-gray-200" />
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No customer records found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Created</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Platform Activity</p>
                  <p className="text-sm font-black text-blue-700">{getUserBookings(selectedUser._id).length} Orders</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;