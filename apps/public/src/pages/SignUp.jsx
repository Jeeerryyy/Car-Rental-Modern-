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
    try {
      await register({ name: form.name.trim(), email: form.email, phone: form.phone.replace(/\s/g, ''), password: form.password });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">Join the Elite.</h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed">
              Become a part of Junagadh's most exclusive self-drive car rental community.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 h-full overflow-y-auto bg-white">
        <div className="w-full max-w-[380px] flex flex-col my-auto py-4">
          <div className="mb-6 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Link to="/" className="flex flex-col items-center -space-y-1.5 no-underline">
                <span className="text-2xl font-black tracking-tight text-black leading-tight uppercase">Modern</span>
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#888] uppercase">Selfdrive</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight mb-1">Create Account</h1>
            <p className="text-[14px] text-[#888] font-medium">Start your journey today</p>
          </div>

          <div className="flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  await loginWithGoogle(credentialResponse.credential);
                  toast.success('Account created & Signed in with Google!');
                  navigate('/');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Google Login failed');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                toast.error('Google Login Failed');
              }}
              theme="outline"
              size="large"
              width="380"
              text="signup_with"
              shape="rectangular"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Or register with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.name ? 'border-red-500' : 'border-border'}`}
                placeholder="Your full name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
                placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.phone ? 'border-red-500' : 'border-border'}`}
                placeholder="+91 9876543210" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`}
                placeholder="Min. 8 chars with uppercase, number & special" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-medium text-dark bg-white outline-none focus:border-dark transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-border'}`}
                placeholder="Re-enter password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-dark text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13.5px] font-medium text-[#888]">
            Already have an account? <Link to="/signin" className="text-black font-bold hover:underline ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
