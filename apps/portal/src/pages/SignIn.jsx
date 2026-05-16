import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOwnerAuth } from '../context/OwnerAuthContext.jsx';
import toast from 'react-hot-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useOwnerAuth();
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
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-dark text-white p-16 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex flex-col -space-y-1.5 group">
            <span className="text-2xl font-black tracking-tight text-white leading-tight group-hover:text-accent transition-colors uppercase">modern self drive</span>
          </Link>
          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Command Center</div>
        </div>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-5xl font-display font-black leading-[1.1] mb-6 tracking-tighter">Fleet management simplified.</h2>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-30">
          <span>© {new Date().getFullYear()} modern self drive</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-off/30">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <div className="lg:hidden mb-12 flex flex-col -space-y-1.5">
              <span className="text-2xl font-black tracking-tight text-dark leading-tight uppercase">modern self drive</span>
            </div>
            <h2 className="text-4xl font-display font-black text-dark mb-3 tracking-tight">Portal Sign In</h2>
            <p className="text-muted font-medium">Access your fleet command center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium text-dark bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.email ? 'border-red-500' : 'border-outline-variant'}`}
                placeholder="owner@modernselfdrive.in" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium text-dark bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.password ? 'border-red-500' : 'border-outline-variant'}`}
                placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-dark text-white text-sm font-black rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50 shadow-lg shadow-dark/20">
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
