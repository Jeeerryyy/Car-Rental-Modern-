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

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'O';
    if (nameOrEmail.includes('@')) {
      return nameOrEmail.split('@')[0].slice(0, 2).toUpperCase();
    }
    return nameOrEmail.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-12 max-w-[1200px] mx-auto w-full flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-[1200px] mx-auto w-full pb-24 md:pb-6 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-black text-dark tracking-tight">System Settings</h1>
        <p className="text-muted font-medium mt-2">Configure your business identity and contact preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">{label}</label>
                <input
                  type={type}
                  value={formData[key] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary max-w-xs text-center md:text-left leading-relaxed">
              Changes are applied globally to the customer-facing platform.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto bg-dark text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black/90 transition-all disabled:opacity-50 shadow-md shadow-dark/10 flex items-center gap-2 justify-center"
            >
              {saving ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">save</span> Save Configuration</>
              )}
            </button>
          </div>
        </div>

        {/* User Account Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant">
               <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-black text-base shadow-sm">
                 {getInitials(user?.name || user?.email || 'Owner')}
               </div>
               <div>
                  <p className="text-sm font-black text-on-surface tracking-tight">Platform Owner</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Fleet Manager</p>
               </div>
            </div>

            <div className="mt-8 space-y-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Active Email</p>
                  <p className="text-sm font-bold text-on-surface select-all">{user?.email}</p>
               </div>
               
               <div className="space-y-4 pt-6 border-t border-outline-variant">
                 <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-between text-on-surface-variant hover:text-on-surface transition-colors"
                 >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">account_circle</span>
                      <span className="text-xs font-black uppercase tracking-widest">Profile Details</span>
                    </div>
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                 </button>

                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-red-600 pt-2 hover:text-red-700 transition-colors"
                 >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-xs font-black uppercase tracking-widest">End Session</span>
                 </button>
               </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 text-blue-900 shadow-sm">
            <span className="material-symbols-outlined text-blue-500">security</span>
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider text-blue-800">
              Operational settings are restricted to administrative accounts only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
