import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SaveIcon, CheckIcon } from '../../components/ui/Icons';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: 'Modern Selfdrive Car'
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPayments: true,
    emailMarketing: false,
    smsAlerts: true
  });

  const [business, setBusiness] = useState({
    businessName: 'Modern Selfdrive Car',
    address: 'Junagadh, Gujarat',
    phone: '+91 87924 92717',
    email: 'contact@modernselfdrive.com'
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs - Desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1 sticky top-8">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'business', label: 'Business' },
              { id: 'security', label: 'Security' }
            ].map(tab => (
              <button
                key={tab.id}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input 
                    type="text"
                    value={profile.company}
                    onChange={e => setProfile({...profile, company: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                {saved ? <CheckIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'emailBookings', label: 'New booking notifications', desc: 'Get notified when someone makes a booking' },
                { key: 'emailPayments', label: 'Payment notifications', desc: 'Receive alerts for payments and refunds' },
                { key: 'emailMarketing', label: 'Marketing updates', desc: 'Receive promotional offers and updates' },
                { key: 'smsAlerts', label: 'SMS alerts', desc: 'Important system notifications via SMS' }
              ].map(item => (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={e => setNotifications({...notifications, [item.key]: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-dark focus:ring-dark"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                {saved ? <CheckIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                {saved ? 'Saved!' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input 
                  type="text"
                  value={business.businessName}
                  onChange={e => setBusiness({...business, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  value={business.address}
                  onChange={e => setBusiness({...business, address: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={business.phone}
                    onChange={e => setBusiness({...business, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={business.email}
                    onChange={e => setBusiness({...business, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                {saved ? <CheckIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
              <button className="btn-primary">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;