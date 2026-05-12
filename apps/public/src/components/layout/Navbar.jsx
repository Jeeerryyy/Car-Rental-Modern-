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

const BUSINESS_NAME = 'Modern Selfdrive Car';

function Navbar() {
  const { pathname } = useLocation();
  const { customer } = useAuth();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

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
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border shadow-sm">
        <nav aria-label="Main navigation"
          className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-0 no-underline group leading-tight" aria-label={`${BUSINESS_NAME} home`}>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-dark uppercase leading-none">Modern</span>
              <span className="text-sm font-bold tracking-[0.2em] text-accent uppercase leading-none ml-0.5">Selfdrive</span>
            </div>
          </Link>

          <ul className="hidden lg:flex gap-9 list-none m-0 p-0">
            {NAV_LINKS.map(({ name, path }) => {
              const active = pathname === path;
              return (
                <li key={name}>
                  <Link to={path} aria-current={active ? 'page' : undefined}
                    className={`text-[14.5px] relative transition-colors ${
                      active ? 'font-semibold text-accent after:content-[""] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:rounded-full'
                      : 'font-medium text-muted hover:text-accent'
                    }`}>
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <DesktopActions customer={customer} />

          <button className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-soft-white text-text hover:bg-light-gray transition-colors"
            onClick={() => setOpen((p) => !p)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu">
            {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      <MobileDrawer open={open} close={close} drawerRef={drawerRef} pathname={pathname} NAV_LINKS={NAV_LINKS} customer={customer} />
    </>
  );
}

export default Navbar;
