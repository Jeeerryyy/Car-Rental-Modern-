import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookiesPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem('cookiesAccepted');
    if (!isAccepted) {
      // Small timeout to animate in elegantly
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100vw-3rem)] p-6 rounded-card shadow-lg flex flex-col gap-4 border"
      style={{ 
        background: '#F8F6F1', 
        borderColor: '#D6D0C7',
        animation: 'menuFadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' 
      }}
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-[13px] font-bold tracking-tight" style={{ color: '#121212' }}>Cookie Consent</h4>
        <p className="text-[12px] leading-relaxed" style={{ color: '#5C5C5C' }}>
          We use cookies to improve your booking experience, analyze site usage, and securely handle payments. By using our site, you agree to our{' '}
          <Link to="/cookies" className="font-semibold underline" style={{ color: '#121212' }}>
            Cookies Policy
          </Link>.
        </p>
      </div>
      <div className="flex gap-3 justify-end items-center">
        <button 
          onClick={handleAccept} 
          className="px-5 py-2.5 rounded-btn text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors duration-200 hover:bg-[#A56A43]"
          style={{ background: '#141414', color: '#F8F6F1' }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
