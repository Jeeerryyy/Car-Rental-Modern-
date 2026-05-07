import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { LockIcon, XIcon, EyeIcon, EyeOffIcon } from '../components/ui/Icons';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false); // rate-limit: 2s after failed attempt

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const setField = useCallback((key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown || loading) return;

    setError('');
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const action = isLogin ? login : register;
    const res = await action(formData);

    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.error);
      // Rate-limit: disable button for 2s after failure
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    const res = await googleLogin(credentialResponse.credential);
    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.error || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');

    try {
      if (forgotStep === 1) {
        await api.post('/api/auth/forgot-password', { email: forgotEmail });
        setForgotMsg('If this email is registered, reset instructions have been sent.');
        setForgotStep(2);
      } else {
        const res = await api.post('/api/auth/reset-password', {
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPassword,
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

  const isSubmitDisabled = loading || cooldown;

  return (
    <div className="min-h-[calc(100vh-72px)] flex bg-white animate-in fade-in duration-300">

      {/* Left Panel — brand image (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-dark relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury car at night — Modern Selfdrive"
          width={1200}
          height={800}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <Link to="/" className="relative z-20 no-underline" aria-label="Back to home">
          <span className="text-[20px] font-bold tracking-tight text-white">Modern Selfdrive Car</span>
        </Link>

        <div className="relative z-20 max-w-md">
          <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
            Your Journey, Your Way.
          </h1>
          <p className="text-gray-300 text-lg">
            Drive across Gujarat with ease. Verified vehicles, transparent pricing, zero hidden fees.
          </p>
        </div>
      </div>

      {/* Right Panel — auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">

          {/* Tab switcher */}
          <div className="flex gap-6 border-b border-border mb-8">
            <button
              type="button"
              className={`pb-4 text-sm font-bold relative ${isLogin ? 'text-dark' : 'text-muted hover:text-dark'}`}
              onClick={() => { setIsLogin(true); setError(''); setShowPassword(false); }}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark rounded-t-full" />}
            </button>
            <button
              type="button"
              className={`pb-4 text-sm font-bold relative ${!isLogin ? 'text-dark' : 'text-muted hover:text-dark'}`}
              onClick={() => { setIsLogin(false); setError(''); setShowPassword(false); }}
            >
              Create Account
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark rounded-t-full" />}
            </button>
          </div>

          <h2 className="font-display text-3xl font-bold text-dark mb-2">
            {isLogin ? 'Welcome back' : 'Join Modern Selfdrive'}
          </h2>
          <p className="text-muted mb-8">
            {isLogin ? 'Enter your details to access your account.' : 'Set up your account in minutes.'}
          </p>

          {error && (
            <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium mb-6 border border-red-100">
              {error}
            </div>
          )}

          {/* Google SSO */}
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required={!isLogin}
                  maxLength={100}
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark focus:ring-2 focus:ring-dark/10 outline-none text-sm font-medium transition-colors"
                  value={formData.name}
                  onChange={setField('name')}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-md border border-border focus:border-dark focus:ring-2 focus:ring-dark/10 outline-none text-sm font-medium transition-colors"
                value={formData.email}
                onChange={setField('email')}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="auth-password" className="block text-xs font-bold text-dark uppercase tracking-wider">
                  Password
                </label>
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
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={128}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-12 rounded-md border border-border focus:border-dark focus:ring-2 focus:ring-dark/10 outline-none text-sm font-medium transition-colors"
                  value={formData.password}
                  onChange={setField('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="auth-phone" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  required={!isLogin}
                  maxLength={15}
                  placeholder="+91"
                  autoComplete="tel"
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark focus:ring-2 focus:ring-dark/10 outline-none text-sm font-medium transition-colors"
                  value={formData.phone}
                  onChange={setField('phone')}
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
              disabled={isSubmitDisabled}
              className="bg-dark text-white font-semibold text-[15px] px-8 py-3.5 rounded-md hover:opacity-90 transition-opacity w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : cooldown ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-8 flex items-center justify-center gap-1">
            <LockIcon className="w-3.5 h-3.5" />
            Securely encrypted using 256-bit technology.
          </p>

          <p className="text-xs text-center text-muted mt-4">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-dark">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-dark">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-md)] p-8 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-dark">Reset Password</h3>
              <button
                onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotMsg(''); }}
                className="text-muted hover:text-dark"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {forgotMsg && (
              <div className={`p-3 rounded-md text-sm font-medium mb-4 ${forgotMsg.includes('success') || forgotMsg.includes('registered') || forgotMsg.includes('sent') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  maxLength={254}
                  className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotStep === 2}
                />
              </div>

              {forgotStep === 2 && (
                <>
                  <div>
                    <label htmlFor="forgot-otp" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                      6-Digit OTP
                    </label>
                    <input
                      id="forgot-otp"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter OTP"
                      className="w-full px-4 py-3 rounded-md border border-border focus:border-dark outline-none text-sm font-medium tracking-[4px] text-center"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div>
                    <label htmlFor="forgot-newpass" className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      id="forgot-newpass"
                      type="password"
                      required
                      minLength={6}
                      maxLength={128}
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
                className="bg-dark text-white font-semibold text-[15px] px-8 py-3 rounded-md hover:opacity-90 transition-opacity w-full disabled:opacity-50"
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
