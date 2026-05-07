import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  PhoneIcon,
  PersonIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  WhatsAppIcon,
} from '../ui/Icons';

const NAV_LINKS = [
  { name: 'Home',    path: '/' },
  { name: 'Cars',    path: '/cars' },
  { name: 'About',   path: '/#about' },
  { name: 'Contact', path: '/contact' },
];

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
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
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border">
        <nav
          aria-label="Main navigation"
          className="max-w-[1320px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-8"
        >
          {/* BUG 5 FIX: Clean text-mark logo, no icons, no decoration */}
          <Link to="/" className="no-underline group" aria-label="Modern Selfdrive Car home">
            <span className="text-[17px] font-bold tracking-tight text-dark leading-none">
              Modern Selfdrive Car
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex gap-9 list-none m-0 p-0">
            {NAV_LINKS.map(({ name, path }) => {
              const active = pathname === path;
              return (
                <li key={name}>
                  <Link
                    to={path}
                    aria-current={active ? 'page' : undefined}
                    className={`text-[14.5px] relative transition-colors ${
                      active
                        ? 'font-semibold text-dark after:content-[""] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-dark after:rounded-full'
                        : 'font-medium text-muted hover:text-dark'
                    }`}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[14px] font-medium text-dark">
                <PhoneIcon className="w-[18px] h-[18px]" />
                +91 87924 92717
              </span>
              <a
                href="https://wa.me/918792492717"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#25D366] hover:opacity-80 transition-opacity"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </a>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="font-semibold text-[14px] text-dark hover:opacity-70 flex items-center gap-1 no-underline"
                >
                  <PersonIcon className="w-[18px] h-[18px]" />
                  {user?.name?.split(' ')[0]}
                </Link>
                <button onClick={logout} className="btn-outline !px-4 !py-2 !text-[13px]">
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-dark text-white border-none rounded-sm px-6 py-2.5 font-body text-[14px] font-semibold cursor-pointer hover:opacity-85 no-underline"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-md border border-border bg-white text-dark hover:bg-off transition-colors"
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      {open && (
        <div
          className="fixed inset-0 top-[72px] bg-black/40 z-[90] lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        aria-label="Mobile navigation"
        className={`fixed top-[72px] left-0 right-0 bg-white z-[95] lg:hidden border-b border-border shadow-lg overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="p-6 flex flex-col gap-2" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ name, path }) => {
            const active = pathname === path;
            return (
              <Link
                key={name}
                to={path}
                aria-current={active ? 'page' : undefined}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-[15px] transition-colors no-underline ${
                  active ? 'bg-off font-bold text-dark' : 'font-medium text-muted hover:bg-off hover:text-dark'
                }`}
              >
                {name}
              </Link>
            );
          })}

          <hr className="border-border my-3" />

          <div className="flex items-center gap-3 px-4 py-3">
            <PhoneIcon className="w-[18px] h-[18px] text-muted" />
            <a href="tel:+918792492717" className="text-[14px] font-medium text-dark no-underline">
              +91 87924 92717
            </a>
          </div>

          <a
            href="https://wa.me/918792492717"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-medium text-[#25D366] hover:bg-green-50 transition-colors no-underline"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>

          <hr className="border-border my-3" />

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-semibold text-dark hover:bg-off transition-colors no-underline"
              >
                <PersonIcon className="w-[18px] h-[18px]" />
                My Profile
              </Link>
              <button
                onClick={() => { logout(); close(); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOutIcon className="w-[18px] h-[18px]" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={close}
              className="bg-dark text-white text-center py-3 rounded-md font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity mx-4"
            >
              Sign In / Create Account
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}

export default Navbar;
