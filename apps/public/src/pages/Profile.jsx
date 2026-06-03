import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { customer, updateCustomer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: customer?.name || '', phone: customer?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  if (!customer) { navigate('/signin'); return null; }

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const res = await authAPI.updateProfile(form); updateCustomer(res.data.data.customer); toast.success('Profile updated successfully!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    setLoading(true);
    try { await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }); toast.success('Password changed successfully!'); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' };
  const readonlyStyle = { background: '#E7E0D4', color: '#121212', border: '1px solid rgba(182,124,61,0.1)', cursor: 'not-allowed' };

  return (
    <div className="min-h-screen py-20 px-6" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[800px] mx-auto">
        <div className="rounded-[12px] p-8 mb-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
          <h1 className="font-display text-3xl font-bold mb-8" style={{ color: '#121212' }}>My Profile</h1>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] font-medium outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>Email</label>
              <input type="email" value={customer.email} readOnly className="w-full px-4 py-3 rounded-[8px] font-medium" style={readonlyStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] font-medium outline-none" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-[8px] font-bold disabled:opacity-50" style={{ background: '#121212', color: '#FFFFFF' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="rounded-[12px] p-8" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
          <h2 className="font-display text-2xl font-bold mb-6" style={{ color: '#121212' }}>Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] font-medium outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] font-medium outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#121212' }}>Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] font-medium outline-none" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-[8px] font-bold disabled:opacity-50" style={{ background: '#121212', color: '#FFFFFF' }}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
