import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon } from '../ui/Icons';
import DesktopActions from './DesktopActions';
import MobileDrawer from './MobileDrawer';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { name: 'Home',    path: '/' },
  { name: 'Cars',    path: '/cars' },
  { name: 'About',   path: '/#about' },
  { name: 'Contact', path: '/contact' },
];

const BUSINESS_NAME = 'modern self drive';

function Navbar() {
  const { pathname } = useLocation();
  const { customer } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  /* Close drawer on every route change (UI-only side-effect) */
  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const nodes = drawerRef.current.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <>
      <header
        className={`fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[calc(100%-2rem)] max-w-[1320px] z-[100] transition-all duration-300 ${
          scrolled ? 'navbar-scrolled' : ''
        }`}
        style={{
          backgroundColor: 'rgba(214,208,199, 0.40)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          border: '1px solid rgba(182, 124, 61, 0.18)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(18,18,18, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingLeft: 'env(safe-area-inset-left)',
        }}
      >
        <nav aria-label="Main navigation"
          className="px-5 lg:px-8 h-[52px] flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 no-underline leading-tight" aria-label={`${BUSINESS_NAME} home`}>
            <img src="/irck-removebg-preview.png" alt="Logo" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-none" style={{ color: '#121212' }}>modern</span>
              <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#A56A43' }}>self drive</span>
            </div>
          </Link>

          <ul className="hidden lg:flex gap-8 list-none m-0 p-0">
            {NAV_LINKS.map(({ name, path }) => {
              const active = pathname === path;
              return (
                <li key={name}>
                  <Link to={path} aria-current={active ? 'page' : undefined}
                    className="text-[13.5px] font-medium tracking-tight no-underline nav-link-premium"
                    style={{
                      color: active ? '#A56A43' : '#121212',
                    }}
                  >
                    {name}
                    {active && <span className="absolute -bottom-[4px] left-0 right-0 h-[2px] rounded-full" style={{ background: '#A56A43' }} />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <DesktopActions customer={customer} />
          <label className="lg:hidden bar" htmlFor="mobile-checkbox" aria-label="Toggle navigation menu">
            <input 
              type="checkbox" 
              id="mobile-checkbox" 
              className="bar-checkbox"
              checked={open} 
              onChange={() => setOpen((p) => !p)} 
            />
            <span className="top"></span>
            <span className="middle"></span>
            <span className="bottom"></span>
          </label>
        </nav>
      </header>

      <MobileDrawer open={open} close={close} drawerRef={drawerRef} pathname={pathname} NAV_LINKS={NAV_LINKS} customer={customer} />
    </>
  );
}

export default Navbar;
