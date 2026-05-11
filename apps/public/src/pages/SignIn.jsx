import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CustomerSignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white font-['Inter'] overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1a1f] overflow-hidden h-full">
        <div className="absolute inset-0 z-0">
          <img src="/auth-bg.png" alt="Luxury Car" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-between w-full h-full">
          <Link to="/" className="flex flex-col -space-y-1.5 group w-fit">
            <span className="text-2xl font-black tracking-tight text-white leading-tight group-hover:text-accent transition-colors uppercase">Modern</span>
            <span className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">Selfdrive</span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">Experience Excellence.</h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed">
              Unlock the journey you deserve with our curated fleet of premium vehicles.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 h-full overflow-y-auto lg:overflow-hidden bg-white">
        <div className="w-full max-w-[380px] flex flex-col my-auto">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Link to="/" className="flex flex-col items-center -space-y-1.5 no-underline">
                <span className="text-2xl font-black tracking-tight text-black leading-tight uppercase">Modern</span>
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#888] uppercase">Selfdrive</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight mb-2">Welcome back!</h1>
            <p className="text-[14px] text-[#888] font-medium">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dark text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13.5px] font-medium text-[#888]">
            Don't have an account? <Link to="/signup" className="text-black font-bold hover:underline ml-1">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
