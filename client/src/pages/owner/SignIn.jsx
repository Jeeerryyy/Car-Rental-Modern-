import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/owner/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    
    setIsSubmitting(true);
    const res = await login({ email, password, role: 'owner' });
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
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
          <h2 className="font-headline-xl text-headline-xl font-light leading-tight">Welcome back to your command center.</h2>
          <p className="font-body-md text-body-md text-on-primary/80 leading-relaxed">Monitor your fleet, manage bookings, and track revenue — all from one elegant dashboard.</p>
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
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Sign In</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access the fleet management portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Password</label>
                <a href="#" className="font-body-sm text-body-sm text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-container text-on-primary rounded-full py-3.5 font-body-md text-body-md font-medium hover:bg-surface-tint transition-colors w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6">
            Don't have an account? <Link to="/owner/signup" className="text-primary font-medium hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
