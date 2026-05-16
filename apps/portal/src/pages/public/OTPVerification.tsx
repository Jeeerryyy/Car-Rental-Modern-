import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);

  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) { navigate('/login', { replace: true }); }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) { inputRefs.current[index + 1]?.focus(); }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) { inputRefs.current[index - 1]?.focus(); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) { newOtp[i] = pasted[i] || ''; }
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    const result = await verifyOtp(email, code);
    setLoading(false);
    if (result.success) {
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } else {
      setError(result.error || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');
    const result = await resendOtp(email);
    setResendLoading(false);
    if (result.success) {
      setSuccess('A new OTP has been sent to your email.');
      setCountdown(600);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Failed to resend OTP.');
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-white border border-outline p-10 text-center rounded-[20px] shadow-md">
          <div className="w-16 h-16 rounded-full bg-[rgba(200,155,91,0.1)] border border-[rgba(200,155,91,0.2)] flex items-center justify-center mx-auto mb-6 text-3xl">📧</div>
          <div className="font-headline-xl text-on-surface mb-2" style={{ fontSize: '32px', letterSpacing: '0.02em' }}>Verify Email</div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            A 6-digit code was sent to <span className="text-secondary font-bold">{email}</span>. Enter it below to activate your account.
          </p>

          {error && <div className="bg-red-50 border border-red-200/25 text-red-500 text-[13px] p-2.5 mb-4 text-left">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200/25 text-green-500 text-[13px] p-2.5 mb-4 text-left">{success}</div>}

          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => { inputRefs.current[i] = el; }}
                className={`w-12 h-14 text-center font-headline-xl text-[26px] bg-surface-variant border text-on-surface outline-none transition-colors ${digit ? 'border-secondary/50' : 'border-outline'}`}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0} />
            ))}
          </div>

          {countdown > 0 && (
            <div className="text-[13px] text-on-surface-variant mb-5">
              Code expires in <strong className="text-secondary font-headline-xl" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>{formatTime(countdown)}</strong>
            </div>
          )}

          <button className={`w-full py-3.5 bg-secondary text-[#111] font-bold text-[13px] uppercase tracking-widest border-0 cursor-pointer transition-colors ${loading || otp.join('').length !== 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B08040]'}`}
            onClick={handleVerify} disabled={loading || otp.join('').length !== 6}>
            {loading ? <><span className="inline-block w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />Verifying...</> : 'Verify & Continue'}
          </button>

          <div className="text-[13px] text-on-surface-variant mt-5">
            Didn't receive the code?{' '}
            <button className="text-secondary font-bold bg-none border-none cursor-pointer" disabled={resendLoading || countdown > 0}
              onClick={handleResend}>
              {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
            </button>
          </div>

          <div className="mt-6">
            <Link to="/login" className="text-[12px] text-on-surface-variant hover:text-on-surface transition-colors no-underline">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}