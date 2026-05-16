import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';

const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;

const CheckCircle = ({ ok }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ok ? '#22c55e' : 'rgba(255,255,255,0.15)'} strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />{ok && <polyline points="9,12 11,14 15,10" />}
  </svg>
);

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: p => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: p => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0–9)', test: p => /[0-9]/.test(p) },
  { id: 'symbol', label: 'One special character', test: p => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p) },
];

const getStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  if (passed <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (passed <= 3) return { level: 2, label: 'Medium', color: '#f59e0b' };
  if (passed <= 4) return { level: 3, label: 'Strong', color: '#22c55e' };
  return { level: 4, label: 'Very Strong', color: '#10b981' };
};

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { customerLogin, customerSignup } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    if (location.search.includes('oauth=success')) {
      navigate(from, { replace: true });
    }
  }, [location.search]);

  const reset = () => { setError(''); setEmail(''); setPassword(''); setName(''); setPhone(''); };
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const strength = tab === 'signup' ? getStrength(password) : null;
  const allRulesPass = tab === 'signup' ? PASSWORD_RULES.every(r => r.test(password)) : true;

  const handleSubmit = async () => {
    setError('');
    if (tab === 'login') {
      if (!email || !password) { setError('Please enter your email and password.'); return; }
      if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
      setLoading(true);
      const result = await customerLogin(email, password);
      setLoading(false);
      if (result.needsVerification) {
        navigate('/verify-otp', { state: { email: result.email } });
        return;
      }
      if (result.success) { navigate(from, { replace: true }); }
      else { setError(result.error || 'Invalid email or password.'); }
      return;
    }
    if (tab === 'signup') {
      if (!name.trim() || !email || !password) { setError('Please fill in all required fields.'); return; }
      if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
      if (!allRulesPass) { setError('Please ensure your password meets all requirements.'); return; }
      setLoading(true);
      const result = await customerSignup(name.trim(), email, password, phone);
      setLoading(false);
      if (result.needsVerification) {
        navigate('/verify-otp', { state: { email: result.email || email } });
      } else if (!result.success) {
        setError(result.error || 'Failed to create account.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
            modern self drive
          <div className="text-[12px] text-on-surface-variant font-bold tracking-widest uppercase">Self-Drive Car Rental</div>
        </div>

        <div className="flex border border-outline mb-0">
          <button className={`flex-1 py-3 text-[12px] font-bold tracking-widest uppercase cursor-pointer transition-all ${tab === 'login' ? 'bg-secondary text-[#111]' : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => { setTab('login'); reset(); }}>Login</button>
          <button className={`flex-1 py-3 text-[12px] font-bold tracking-widest uppercase cursor-pointer transition-all ${tab === 'signup' ? 'bg-secondary text-[#111]' : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => { setTab('signup'); reset(); }}>Sign Up</button>
        </div>

        <div className="bg-white border border-outline border-t-0 p-7 rounded-b-[20px] shadow-md">
          {error && (
            <div className="bg-red-50 border border-red-200/25 text-red-500 text-[13px] p-2.5 mb-4">{error}</div>
          )}

          {tab === 'signup' && (
            <>
              <div className="mb-4">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Full Name *</label>
                <input className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-[15px] outline-none focus:border-secondary/50 box-border"
                  placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Phone Number</label>
                <input className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-[15px] outline-none focus:border-secondary/50 box-border"
                  type="tel" placeholder="Enter 10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Email Address *</label>
            <input className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-[15px] outline-none focus:border-secondary/50 box-border"
              type="email" placeholder="Enter your email address" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">Password *</label>
            <div className="relative">
              <input className="w-full p-3 bg-surface-variant border border-outline text-on-surface font-body text-[15px] outline-none focus:border-secondary/50 box-border pr-10"
                type={showPass ? 'text' : 'password'} placeholder={tab === 'signup' ? 'Min 8 chars, mixed case, number, symbol' : 'Enter password'}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-on-surface-variant p-1"
                onClick={() => setShowPass(v => !v)} type="button">
                <EyeIcon open={showPass} />
              </button>
            </div>

            {tab === 'signup' && password && (
              <div className="mt-2">
                <div className="h-0.5 bg-surface-dim mb-1.5 overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${(strength.level / 4) * 100}%`, background: strength.color }} />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: strength.color }}>{strength.label}</div>
                <div className="mt-2.5 flex flex-col gap-1">
                  {PASSWORD_RULES.map(rule => (
                    <div key={rule.id} className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: rule.test(password) ? '#22c55e' : 'rgba(255,255,255,0.25)' }}>
                      <CheckCircle ok={rule.test(password)} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className={`w-full py-3.5 bg-secondary text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer transition-colors ${(loading || (tab === 'signup' && !allRulesPass)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B08040]'}`}
            disabled={loading || (tab === 'signup' && !allRulesPass)} onClick={handleSubmit}>
            {loading ? <span className="inline-block w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" /> : null}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="relative h-px bg-outline my-5">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] text-on-surface-variant font-bold tracking-widest uppercase whitespace-nowrap">or</span>
          </div>

          <div className="text-center text-[12px] text-on-surface-variant">
            {tab === 'login'
              ? <>New here? <button className="text-secondary font-bold bg-none border-none cursor-pointer" onClick={() => { setTab('signup'); reset(); }}>Create an account</button></>
              : <>Already have an account? <button className="text-secondary font-bold bg-none border-none cursor-pointer" onClick={() => { setTab('login'); reset(); }}>Sign in</button></>
            }
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-[12px] text-on-surface-variant no-underline hover:text-on-surface transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}