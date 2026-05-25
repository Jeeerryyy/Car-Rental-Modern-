import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function CustomerSignUp() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s'-]+$/.test(form.name.trim())) errs.name = 'Name can only contain letters, spaces, and hyphens';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Invalid Indian mobile number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Must contain a number';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) errs.password = 'Must contain a special character';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await register({ name: form.name.trim(), email: form.email, phone: form.phone.replace(/\s/g, ''), password: form.password }); toast.success('Account created successfully!'); navigate('/'); }
    catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
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
            <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight" style={{ color: '#FFFFFF' }}>Join the Elite.</h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(220,207,186,0.5)' }}>Become a part of Junagadh's most exclusive self-drive car rental community.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 h-full overflow-y-auto" style={{ background: '#F9F8F3' }}>
        <div className="w-full max-w-[380px] flex flex-col my-auto py-4">
          <div className="mb-6 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Link to="/" className="flex flex-col items-center -space-y-1.5 no-underline">
                <span className="text-2xl font-black tracking-tight leading-tight uppercase" style={{ color: '#19130E' }}>Modern</span>
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: '#6b5e50' }}>Selfdrive</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#19130E' }}>Create Account</h1>
            <p className="text-[14px] font-medium" style={{ color: '#6b5e50' }}>Start your journey today</p>
          </div>

          <div className="flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => { setLoading(true); try { await loginWithGoogle(credentialResponse.credential); toast.success('Account created & Signed in with Google!'); navigate('/'); } catch (err) { toast.error(err.response?.data?.message || 'Google Login failed'); } finally { setLoading(false); } }}
              onError={() => { toast.error('Google Login Failed'); }}
              theme="outline" size="large" width="380" text="signup_with" shape="rectangular"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(182,124,61,0.2)' }}></div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b5e50' }}>Or register with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(182,124,61,0.2)' }}></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.name)} placeholder="Your full name" />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.email)} placeholder="you@example.com" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.phone)} placeholder="+91 9876543210" />
              {errors.phone && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.password)} placeholder="Min. 8 chars with uppercase, number & special" />
              {errors.password && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#19130E' }}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-[8px] text-sm font-medium outline-none" style={inputStyle(errors.confirmPassword)} placeholder="Re-enter password" />
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold rounded-[8px] disabled:opacity-50 mt-2" style={{ background: '#19130E', color: '#FFFFFF' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13.5px] font-medium" style={{ color: '#6b5e50' }}>
            Already have an account? <Link to="/signin" className="font-bold no-underline ml-1" style={{ color: '#19130E' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
