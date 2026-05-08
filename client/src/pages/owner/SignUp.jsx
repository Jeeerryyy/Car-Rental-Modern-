import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success('Account created! Please sign in.');
      navigate('/owner/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-primary-container text-on-primary p-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Modern Selfdrive</h1>
          <p className="text-on-primary/60 font-body-md text-body-md">Fleet Management Portal</p>
        </div>
        <div className="flex flex-col gap-6 max-w-sm">
          <h2 className="font-headline-xl text-headline-xl font-light leading-tight">Start managing your fleet today.</h2>
          <p className="font-body-md text-body-md text-on-primary/80 leading-relaxed">Create your account to access powerful fleet management tools, real-time analytics, and seamless booking management.</p>
          <div className="flex flex-col gap-3 mt-4">
            {[
              { icon: 'verified', text: 'Real-time fleet tracking' },
              { icon: 'analytics', text: 'Revenue analytics & reports' },
              { icon: 'calendar_today', text: 'Automated booking management' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-on-primary/70">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-body-sm text-body-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-on-primary/40 font-body-sm text-body-sm">
          <span>© 2024 Modern Selfdrive</span>
          <span>·</span>
          <span>Fleet CRM</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">M</div>
            <span className="text-primary font-bold text-xl tracking-tight">Modern Selfdrive</span>
          </div>

          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Create Account</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Set up your fleet management profile in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                <input
                  value={formData.name}
                  onChange={handle('name')}
                  placeholder="Jerry Patel"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                <input
                  value={formData.email}
                  onChange={handle('email')}
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input
                  value={formData.password}
                  onChange={handle('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-12 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input
                  value={formData.confirm}
                  onChange={handle('confirm')}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container cursor-pointer" />
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-container text-on-primary rounded-full py-3.5 font-body-md text-body-md font-medium hover:bg-surface-tint transition-colors w-full disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            Already have an account? <Link to="/owner/signin" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
