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
  const drawerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  /* Close drawer on every route change (UI-only side-effect) */
  useEffect(() => { close(); }, [pathname, close]);

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
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          backgroundColor: 'rgba(220,207,186,0.60)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '1px solid rgba(182,124,61,0.15)',
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
              <span className="text-lg font-black tracking-tighter uppercase leading-none" style={{ color: '#19130E' }}>modern</span>
              <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#B67C3D' }}>self drive</span>
            </div>
          </Link>

          <ul className="hidden lg:flex gap-8 list-none m-0 p-0">
            {NAV_LINKS.map(({ name, path }) => {
              const active = pathname === path;
              return (
                <li key={name}>
                  <Link to={path} aria-current={active ? 'page' : undefined}
                    className={`text-[14px] relative no-underline ${
                      active ? 'font-semibold after:content-[""] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full'
                      : 'font-medium'
                    }`}
                    style={{
                      color: active ? '#B67C3D' : '#19130E',
                      ...(active ? { '--tw-after-bg': '#B67C3D' } : {}),
                    }}
                  >
                    {name}
                    {active && <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: '#B67C3D' }} />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <DesktopActions customer={customer} />

          <button className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border"
            style={{ borderColor: 'rgba(182,124,61,0.15)', background: 'rgba(220,207,186,0.4)', color: '#19130E' }}
            onClick={() => setOpen((p) => !p)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu">
            {open ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      <MobileDrawer open={open} close={close} drawerRef={drawerRef} pathname={pathname} NAV_LINKS={NAV_LINKS} customer={customer} />
    </>
  );
}

export default Navbar;
