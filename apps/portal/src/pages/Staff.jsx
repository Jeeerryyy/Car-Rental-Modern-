import { useState, useEffect } from 'react';
import { getStaff, createStaff, toggleStaffStatus, deleteStaff } from '../api/staff.js';
import toast from 'react-hot-toast';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      setStaffList(res.data.data.staff || []);
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error(error.response?.data?.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill all fields');
    }

    try {
      setSubmitting(true);
      await createStaff(formData);
      toast.success('Staff member added successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleStaffStatus(id);
      const updatedStaff = res.data.data.staff;
      setStaffList(prev => prev.map(s => 
        s._id === id ? updatedStaff : s
      ));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await deleteStaff(id);
      setStaffList(prev => prev.filter(s => s._id !== id));
      toast.success('Staff member removed');
    } catch (error) {
      toast.error('Failed to remove staff member');
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2 tracking-tight">Staff Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Create and manage accounts for your team members. Staff can manage bookings and view fleet data but cannot access settings or reports.
            <span className="block mt-1 font-bold text-primary/70 italic text-xs uppercase tracking-widest">Limit: Maximum 2 staff members</span>
          </p>
        </div>
        
        {staffList.length < 2 && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            Add Staff Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-surface-container-lowest border border-outline-variant rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : staffList.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-16 text-center max-w-2xl mx-auto w-full">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-primary/30">badge</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-3">No staff members yet</h3>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Assign team members to help manage your bookings and fleet. They'll have their own login credentials but limited access.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
          >
            Create First Staff Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staffList.map(staff => (
            <div key={staff._id} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center text-2xl font-bold shadow-inner">
                    {(staff.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface tracking-tight">{staff.name || 'Unknown'}</h4>
                    <p className="text-sm text-on-surface-variant font-medium">{staff.email}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-outline-variant">
                <button 
                  onClick={() => handleToggleStatus(staff._id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    staff.isActive 
                    ? 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {staff.isActive ? 'block' : 'check_circle'}
                  </span>
                  {staff.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDeleteStaff(staff._id)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          {staffList.length < 2 && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-outline-variant rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-outline-variant group-hover:border-primary/50 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="font-bold">Add another staff member</span>
              <span className="text-xs opacity-60 uppercase tracking-widest font-black">1 slot remaining</span>
            </button>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-[2rem] shadow-2xl border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-on-surface tracking-tight">New Staff Account</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-on-surface-variant">Create login credentials for your team member.</p>
            </div>

            <form onSubmit={handleAddStaff} className="p-8 pt-4 space-y-5">
              <div>
                <label className="block text-[11px] font-black text-secondary uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-surface border border-outline-variant rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-secondary uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="staff@moderndrive.in"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-surface border border-outline-variant rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-secondary uppercase tracking-widest mb-2 ml-1">Initial Password</label>
                <input 
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 bg-surface border border-outline-variant rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
                <p className="text-[10px] text-on-surface-variant mt-2 ml-1 italic font-medium">The staff member can change this later from their profile.</p>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined">verified_user</span>
                    Create Staff Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
