import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp+password
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const action = isLogin ? login : register;
    const res = await action(formData);
    
    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');

    try {
      if (forgotStep === 1) {
        await api.post('/api/auth/forgot-password', { email: forgotEmail });
        setForgotMsg('If this email is registered, you will receive reset instructions. Check your console/email.');
        setForgotStep(2);
      } else {
        const res = await api.post('/api/auth/reset-password', {
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPassword
        });
        setForgotMsg(res.data.message || 'Password reset successful!');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotEmail('');
          setForgotOtp('');
          setForgotNewPassword('');
          setForgotMsg('');
        }, 2000);
      }
    } catch (err) {
      setForgotMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex bg-white">
      
      {/* Left Panel (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-dark relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury Car Night" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        
        <Link to="/" className="relative z-20 flex flex-col leading-none no-underline inline-block">
          <span className="text-[24px] font-extrabold tracking-[-0.5px] text-white">MODERN</span>
          <span className="text-[12px] font-medium tracking-[3px] text-gray-400 uppercase mt-1">SELFDRIVE CAR</span>
        </Link>

        <div className="relative z-20 max-w-md">
          <h1 className="font-display text-4xl font-bold mb-4 leading-tight">Your Journey, Your Way. Drive across Gujarat with ease.</h1>
          <p className="text-gray-300 text-lg">Join Modern Selfdrive Car today for hassle-free bookings and verified vehicles.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          
          <div className="flex gap-6 border-b border-border mb-8">
            <button 
              className={`pb-4 text-sm font-bold relative ${isLogin ? 'text-dark' : 'text-muted hover:text-dark'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark rounded-t-full"></div>}
            </button>
            <button 
              className={`pb-4 text-sm font-bold relative ${!isLogin ? 'text-dark' : 'text-muted hover:text-dark'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Create Account
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark rounded-t-full"></div>}
            </button>
          </div>

          <h2 className="font-display text-3xl font-bold text-dark mb-2">
            {isLogin ? 'Welcome back' : 'Join Modern Selfdrive'}
          </h2>
          <p className="text-muted mb-8">
            {isLogin ? 'Enter your details to access your account.' : 'Set up your premium account in minutes.'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  id="auth-name"
                  type="text" required={!isLogin}
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="auth-email" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="auth-email"
                type="email" required
                className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="auth-password" className="block text-xs font-bold text-dark uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-dark hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                id="auth-password"
                type="password" required
                className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="auth-phone" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  id="auth-phone"
                  type="tel" required={!isLogin}
                  placeholder="+91"
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            )}

            {isLogin && (
              <label htmlFor="auth-remember" className="flex items-center gap-2 cursor-pointer mt-1">
                <input id="auth-remember" type="checkbox" className="w-4 h-4 rounded border-border text-dark focus:ring-dark accent-dark" />
                <span className="text-sm text-dark font-medium">Remember me for 30 days</span>
              </label>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="bg-dark text-white font-semibold text-[15px] px-8 py-3.5 rounded-md hover:bg-dark-2 transition-colors w-full mt-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-8 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Securely encrypted using 256-bit technology.
          </p>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setShowForgotModal(false)}>
          <div className="bg-white rounded-[var(--radius-md)] p-8 max-w-md w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-dark">Reset Password</h3>
              <button onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotMsg(''); }} className="text-muted hover:text-dark" aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {forgotMsg && (
              <div className={`p-3 rounded-md text-sm font-medium mb-4 ${forgotMsg.includes('success') || forgotMsg.includes('registered') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotStep === 2}
                />
              </div>

              {forgotStep === 2 && (
                <>
                  <div>
                    <label htmlFor="forgot-otp" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">6-Digit OTP</label>
                    <input
                      id="forgot-otp"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter OTP from console/email"
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium tracking-[4px] text-center"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div>
                    <label htmlFor="forgot-newpass" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">New Password</label>
                    <input
                      id="forgot-newpass"
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="bg-dark text-white font-semibold text-[15px] px-8 py-3 rounded-md hover:bg-dark-2 transition-colors w-full"
              >
                {forgotLoading ? 'Processing...' : (forgotStep === 1 ? 'Send Reset OTP' : 'Reset Password')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
