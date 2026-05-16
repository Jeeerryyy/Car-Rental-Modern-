import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function CustomerSignIn() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
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
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/'); }
    catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = (hasError) => ({
    background: '#F2EEE5', color: '#19130E',
    border: hasError ? '1px solid #b91c1c' : '1px solid rgba(182,124,61,0.15)',
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#F9F8F3' }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-full" style={{ background: '#19130E' }}>
        <div className="absolute inset-0 z-0">
          <img src="/auth-bg.png" alt="Luxury Car" loading="lazy" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(25,19,14,0.7), transparent)' }} />
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-between w-full h-full">
          <Link to="/" className="flex flex-col -space-y-1.5 w-fit no-underline">
            <span className="text-2xl font-black tracking-tight leading-tight uppercase" style={{ color: '#FFFFFF' }}>Modern</span>
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: 'rgba(220,207,186,0.5)' }}>Selfdrive</span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight" style={{ color: '#FFFFFF' }}>Experience Excellence.</h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(220,207,186,0.5)' }}>Unlock the journey you deserve with our curated fleet of premium vehicles.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 h-full overflow-y-auto" style={{ background: '#F9F8F3' }}>
        <div className="w-full max-w-[380px] flex flex-col my-auto">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Link to="/" className="flex flex-col items-center -space-y-1.5 no-underline">
                <span className="text-2xl font-black tracking-tight leading-tight uppercase" style={{ color: '#19130E' }}>Modern</span>
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: '#6b5e50' }}>Selfdrive</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#19130E' }}>Welcome back!</h1>
            <p className="text-[14px] font-medium" style={{ color: '#6b5e50' }}>Sign in to your account</p>
          </div>

          <div className="flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => { setLoading(true); try { await loginWithGoogle(credentialResponse.credential); toast.success('Signed in with Google!'); navigate('/'); } catch (err) { toast.error(err.response?.data?.message || 'Google Login failed'); } finally { setLoading(false); } }}
              onError={() => { toast.error('Google Login Failed'); }}
              useOneTap theme="outline" size="large" width="380" text="continue_with" shape="rectangular"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(182,124,61,0.2)' }}></div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b5e50' }}>Or continue with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(182,124,61,0.2)' }}></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.email)} placeholder="you@example.com" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.password)} placeholder="••••••••" />
              {errors.password && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold rounded-[8px] disabled:opacity-50 mt-2" style={{ background: '#19130E', color: '#FFFFFF' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13.5px] font-medium" style={{ color: '#6b5e50' }}>
            Don't have an account? <Link to="/signup" className="font-bold no-underline ml-1" style={{ color: '#19130E' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
