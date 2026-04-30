import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Cars', path: '/cars' },
  { name: 'Contact', path: '/contact' },
];

const WHATSAPP_SVG = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export default function Navbar() {
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
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, close]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border">
        <nav aria-label="Main navigation" className="max-w-[1320px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-8">

          <Link to="/" className="flex flex-col leading-none no-underline">
            <span className="text-[18px] font-extrabold tracking-[-0.5px] text-dark">MODERN</span>
            <span className="text-[10px] font-medium tracking-[2.5px] text-muted uppercase mt-0.5">SELFDRIVE CAR</span>
          </Link>

          {/* desktop links */}
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

          {/* desktop actions */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[14px] font-medium text-dark">
                <span className="material-symbols-outlined text-[18px]">call</span>
                +91 87924 92717
              </span>
              <a href="https://wa.me/918792492717" target="_blank" rel="noreferrer" className="flex items-center text-[#25D366] hover:opacity-80 transition-opacity" aria-label="Chat on WhatsApp">
                {WHATSAPP_SVG}
              </a>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="font-semibold text-[14px] text-dark hover:opacity-70 flex items-center gap-1 no-underline">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  {user?.name?.split(' ')[0]}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/analytics" className="font-semibold text-[14px] text-red-600 hover:opacity-70 no-underline">Admin</Link>
                )}
                <button onClick={logout} className="btn-outline !px-4 !py-2 !text-[13px]">Logout</button>
              </div>
            ) : (
              <Link to="/auth" className="bg-dark text-white border-none rounded-sm px-6 py-2.5 font-body text-[14px] font-semibold cursor-pointer transition-all hover:opacity-85 hover:-translate-y-px no-underline">
                Sign In
              </Link>
            )}
          </div>

          {/* hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-md border border-border bg-white text-dark hover:bg-off transition-colors"
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span className="material-symbols-outlined text-[24px]">{open ? 'close' : 'menu'}</span>
          </button>
        </nav>
      </header>

      {/* backdrop */}
      {open && <div className="fixed inset-0 top-[72px] bg-black/40 z-[90] lg:hidden" onClick={close} aria-hidden="true" />}

      {/* drawer */}
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
              <Link key={name} to={path} aria-current={active ? 'page' : undefined} onClick={close}
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
            <span className="material-symbols-outlined text-[18px] text-muted">call</span>
            <a href="tel:+918792492717" className="text-[14px] font-medium text-dark no-underline">+91 87924 92717</a>
          </div>

          <a href="https://wa.me/918792492717" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-medium text-[#25D366] hover:bg-green-50 transition-colors no-underline"
          >
            {WHATSAPP_SVG}
            Chat on WhatsApp
          </a>

          <hr className="border-border my-3" />

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={close} className="flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-semibold text-dark hover:bg-off transition-colors no-underline">
                <span className="material-symbols-outlined text-[18px]">person</span>
                My Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/analytics" onClick={close} className="flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-semibold text-red-600 hover:bg-red-50 transition-colors no-underline">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Admin Panel
                </Link>
              )}
              <button onClick={() => { logout(); close(); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-semibold text-red-600 hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={close} className="bg-dark text-white text-center py-3 rounded-md font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity mx-4">
              Sign In / Create Account
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
