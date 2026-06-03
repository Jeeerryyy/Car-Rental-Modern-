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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  return (
    <div className="auth-sanctuary-container">
      <div className="sanctuary-bg">
        <div className="sanctuary-leaf sanctuary-leaf-1"></div>
        <div className="sanctuary-leaf sanctuary-leaf-2"></div>
        <div className="sanctuary-leaf sanctuary-leaf-3"></div>
        <div className="sanctuary-leaf sanctuary-leaf-4"></div>
      </div>

      <div className="wellness-card" style={{ maxWidth: '460px' }}>
        <div className="organic-border"></div>

        <div className="mindful-header">
          <div className="flex items-center justify-center gap-3 no-underline leading-tight mb-4">
            <img src="/irck-removebg-preview.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter uppercase leading-none" style={{ color: '#121212' }}>modern</span>
              <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#A56A43' }}>self drive</span>
            </div>
          </div>
          <p className="text-[12px] font-bold uppercase tracking-wider mt-1.5" style={{ color: '#A56A43' }}>Sign up to book your ride</p>
        </div>

        <div className="flex justify-center w-full z-10 mb-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => { setLoading(true); try { await loginWithGoogle(credentialResponse.credential); toast.success('Account created & Signed in with Google!'); navigate('/'); } catch (err) { toast.error(err.response?.data?.message || 'Google Login failed'); } finally { setLoading(false); } }}
            onError={() => { toast.error('Google Login Failed'); }}
            theme="outline" size="large" width="300" text="signup_with" shape="pill"
          />
        </div>

        <div className="balance-divider">
          <div className="divider-branch"></div>
          <div className="divider-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L8 8h8l-4-6zM12 22l4-6H8l4 6zM2 12l6-4v8l-6-4zM22 12l-6 4V8l6 4z" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <div className="divider-branch"></div>
        </div>

        <form onSubmit={handleSubmit} className="z-10 flex flex-col w-full">
          <div className="drive-ignition-panel">
            <div className="ignition-row">
              <div className="ignition-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="ignition-field-body">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your Full Name"
                  required 
                  autoComplete="name"
                />
              </div>
            </div>
            {errors.name && <div className="px-4 pb-2"><span className="gentle-error">{errors.name}</span></div>}

            <div className="ignition-row">
              <div className="ignition-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="19" r="3" />
                  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                  <circle cx="18" cy="5" r="3" />
                </svg>
              </div>
              <div className="ignition-field-body">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={form.email} 
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@email.com"
                  required 
                  autoComplete="email"
                />
              </div>
            </div>
            {errors.email && <div className="px-4 pb-2"><span className="gentle-error">{errors.email}</span></div>}

            <div className="ignition-row">
              <div className="ignition-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="ignition-field-body">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={form.phone} 
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Mobile Number"
                  required 
                  autoComplete="tel"
                />
              </div>
            </div>
            {errors.phone && <div className="px-4 pb-2"><span className="gentle-error">{errors.phone}</span></div>}

            <div className="ignition-row">
              <div className="ignition-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <div className="ignition-field-body">
                <label htmlFor="password">Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={form.password} 
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                />
              </div>
              <button 
                type="button" 
                className="ignition-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <div className="px-4 pb-2"><span className="gentle-error">{errors.password}</span></div>}

            <div className="ignition-row">
              <div className="ignition-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <div className="ignition-field-body">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                />
              </div>
              <button 
                type="button" 
                className="ignition-toggle" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <div className="px-4 pb-2"><span className="gentle-error">{errors.confirmPassword}</span></div>}
          </div>

          <button type="submit" disabled={loading} className="animate-btn w-full justify-center">
            <span>{loading ? 'Registering...' : 'Start Engine'}</span>
          </button>
        </form>

        <div className="text-center text-[13.5px] font-semibold z-10 mt-6" style={{ color: '#5C5C5C' }}>
          Already have an account? <Link to="/signin" className="font-bold no-underline ml-1 text-[#121212] hover:text-[#A56A43] transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
