import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const { customer, customerLogout } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    customerLogout();
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (isOpen) return;
      setHidden(y > lastScrollY && y > 100);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, isOpen]);

  const navLinks = [
    { label: 'Fleet', href: '/cars', isRoute: true },
    { label: 'Support', href: '/support', isRoute: true },
    { label: 'Owner', href: '/dashboard', isRoute: true },
  ];

  return (
    <>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[1100] bg-surface flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {navLinks.map(link => (
          <Link key={link.label} to={link.href}
            className="font-headline-xl text-on-surface-variant hover:text-secondary transition-colors"
            style={{ fontSize: '42px', letterSpacing: '0.04em' }}
            onClick={() => setIsOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className="h-px bg-outline-variant w-10 my-4" />
        {customer ? (
          <button onClick={handleLogout} className="font-headline-xl text-red-400 hover:text-red-600" style={{ fontSize: '28px', letterSpacing: '0.04em' }}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="font-headline-xl text-secondary hover:text-[#B08040]" style={{ fontSize: '28px', letterSpacing: '0.04em' }} onClick={() => setIsOpen(false)}>
            Login
          </Link>
        )}
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-[1200] transition-transform duration-400 ${hidden ? '-translate-y-full' : ''}`}
        style={{ padding: '16px 20px' }}>
        <div className="max-w-[1400px] mx-auto bg-[rgba(17,24,39,0.88)] backdrop-blur-[75px] border border-outline/10 px-6 py-2.5 transition-shadow duration-300"
          style={scrolled ? { boxShadow: '0 8px 40px rgba(0,0,0,0.6)' } : {}}>
          <div className="flex items-center justify-between gap-6">
            <Link to="/" className="font-headline-xl text-on-surface flex-shrink-0" style={{ fontSize: '22px', letterSpacing: '0.04em' }}>
              modern self drive
            </Link>

            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(link => (
                <Link key={link.label} to={link.href}
                  className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant hover:text-on-surface transition-colors px-3.5 py-1.5">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {customer ? (
                <Link to="/account"
                  className="text-[12px] font-bold text-on-surface-variant hover:text-on-surface transition-colors tracking-wide"
                  style={{ letterSpacing: '0.06em' }}>
                  My Account
                </Link>
              ) : (
                <Link to="/login"
                  className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant hover:text-on-surface border border-outline/20 px-3.5 py-1.5 transition-all hover:border-white/20"
                  style={{ textDecoration: 'none' }}>
                  Login
                </Link>
              )}

              <Link to="/cars"
                className="bg-secondary text-[#111] font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 hover:bg-[#B08040] transition-colors"
                style={{ textDecoration: 'none' }}>
                Book Now
              </Link>

              <button
                className="md:hidden w-9 h-9 border border-outline/20 bg-[#172033] flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => setIsOpen(o => !o)}>
                <span className={`w-5 h-0.5 bg-on-surface transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-5 h-0.5 bg-on-surface transition-all ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-0.5 bg-on-surface transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}