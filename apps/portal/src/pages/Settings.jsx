import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSettings, updateSettings } from '../api/settings';
import { useOwnerAuth } from '../context/OwnerAuthContext';

const FIELDS = [
  { key: 'businessName', label: 'Business Name', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'email', label: 'Contact Email', type: 'email' },
  { key: 'address', label: 'Business Address', type: 'text' },
];

export default function Settings() {
  const [formData, setFormData] = useState({ businessName: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logout, user } = useOwnerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await getSettings();
        setFormData(data.data || data.settings || data);
      } catch {} finally { setLoading(false); }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Settings saved');
    } catch {} finally { setSaving(false); }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/signin');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-black text-dark tracking-tight">System Settings</h1>
        <p className="text-muted font-medium mt-2">Configure your business identity and contact preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-8 bg-white rounded-[40px] border border-border p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {FIELDS.map(({ key, label, type }) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">{label}</label>
                <input
                  type={type}
                  value={formData[key] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full bg-off/50 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-dark focus:border-dark focus:ring-4 focus:ring-dark/5 transition-all outline-none"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted max-w-xs text-center md:text-left">
              Changes are applied globally to the customer-facing platform.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-dark text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl px-10 py-5 disabled:opacity-50 shadow-lg shadow-dark/10"
            >
              {saving ? 'Syncing...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* User Account Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl border border-border p-8">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
               <div className="w-12 h-12 bg-dark text-white rounded-full flex items-center justify-center font-black text-xs">MS</div>
               <div>
                  <p className="text-sm font-black text-dark tracking-tight">Platform Owner</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Fleet Manager</p>
               </div>
            </div>

            <div className="mt-8 space-y-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Email</p>
                  <p className="text-sm font-bold text-dark">{user?.email}</p>
               </div>
               
               <div className="space-y-4 pt-6 border-t border-border">
                 <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-between text-muted hover:text-dark transition-colors"
                 >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">account_circle</span>
                      <span className="text-xs font-black uppercase tracking-widest">Profile Details</span>
                    </div>
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                 </button>

                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-red-600 pt-2"
                 >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-xs font-black uppercase tracking-widest">End Session</span>
                 </button>
               </div>
            </div>
          </div>

          <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 flex gap-4 text-blue-900">
            <span className="material-symbols-outlined text-blue-500">security</span>
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">
              Operational settings are restricted to administrative accounts only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
