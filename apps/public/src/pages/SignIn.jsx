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
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="auth-sanctuary-container">
      <div className="sanctuary-bg">
        <div className="sanctuary-leaf sanctuary-leaf-1"></div>
        <div className="sanctuary-leaf sanctuary-leaf-2"></div>
        <div className="sanctuary-leaf sanctuary-leaf-3"></div>
        <div className="sanctuary-leaf sanctuary-leaf-4"></div>
      </div>

      <div className="wellness-card">
        <div className="organic-border"></div>

        <div className="mindful-header">
          <div className="flex items-center justify-center gap-3 no-underline leading-tight mb-4">
            <img src="/irck-removebg-preview.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter uppercase leading-none" style={{ color: '#121212' }}>modern</span>
              <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#A56A43' }}>self drive</span>
            </div>
          </div>
          <p className="text-[12px] font-bold uppercase tracking-wider mt-1.5" style={{ color: '#A56A43' }}>Log in to your account</p>
        </div>

        <div className="flex justify-center w-full z-10 mb-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => { setLoading(true); try { await loginWithGoogle(credentialResponse.credential); toast.success('Signed in with Google!'); navigate('/'); } catch (err) { toast.error(err.response?.data?.message || 'Google Login failed'); } finally { setLoading(false); } }}
            onError={() => { toast.error('Google Login Failed'); }}
            useOneTap theme="outline" size="large" width="300" text="continue_with" shape="pill"
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
                  autoComplete="current-password"
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
          </div>

          <div className="sleek-auth-options">
            <label className="drive-checkbox">
              <input type="checkbox" id="remember" name="remember" />
              <span className="checkbox-dial"></span>
              <span className="drive-checkbox-text">Remember me</span>
            </label>
            <a href="#" className="drive-link" onClick={e => { e.preventDefault(); toast('Under development. Drive safe!', { icon: '🚗' }); }}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className="animate-btn w-full justify-center">
            <span>{loading ? 'Starting Engine...' : 'Start Engine'}</span>
          </button>
        </form>

        <div className="text-center text-[13.5px] font-semibold z-10 mt-6" style={{ color: '#5C5C5C' }}>
          New to Modern Drive? <Link to="/signup" className="font-bold no-underline ml-1 text-[#121212] hover:text-[#A56A43] transition-colors">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
