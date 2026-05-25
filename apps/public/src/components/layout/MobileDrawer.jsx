import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PhoneIcon, WhatsAppIcon, UserIcon } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function MobileDrawer({ open, close, drawerRef, pathname, NAV_LINKS }) {
  const { customer, logout } = useAuth();

  /* Close drawer on every route change (UI-only side-effect) */
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
      <>
      <div 
        className={`fixed inset-0 z-[90] lg:hidden transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        style={{ top: '76px', background: 'rgba(25,19,14,0.35)' }} 
        onClick={close} 
        aria-hidden="true" 
      />

      <div id="mobile-menu" ref={drawerRef}
        role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined} aria-label="Mobile navigation"
        className={`fixed left-0 right-0 z-[95] lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{
          top: '76px',
          background: '#F2EEE5',
          borderBottom: '1px solid rgba(182,124,61,0.15)',
          boxShadow: '0 1px 3px rgba(25,19,14,0.06)',
        }}
      >
        <nav className="p-5 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ name, path }) => {
            const active = pathname === path;
            return (
              <Link key={name} to={path} aria-current={active ? 'page' : undefined} onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] no-underline"
                style={{
                  color: active ? '#B67C3D' : '#19130E',
                  fontWeight: active ? 700 : 500,
                  background: active ? 'rgba(182,124,61,0.08)' : 'transparent',
                }}
              >
                {name}
              </Link>
            );
          })}

          <hr style={{ border: 'none', borderTop: '1px solid rgba(182,124,61,0.15)', margin: '8px 0' }} />

          <div className="flex items-center gap-3 px-4 py-3">
            <PhoneIcon className="w-4 h-4" style={{ color: '#B67C3D' }} />
            <a href="tel:+919004460634" className="text-[14px] font-medium no-underline" style={{ color: '#19130E' }}>+91 90044 60634</a>
          </div>

          <a href="https://wa.me/919004460634" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium no-underline"
            style={{ color: '#25D366' }}
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(182,124,61,0.15)', margin: '8px 0' }} />

          <div className="flex flex-col gap-1">
            {customer ? (
              <>
                <Link to="/my-bookings" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#19130E' }}
                >
                  <UserIcon className="w-5 h-5" style={{ color: '#B67C3D' }} />
                  My Bookings
                </Link>
                <Link to="/profile" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#19130E' }}
                >
                  {customer.name}
                </Link>
                <button onClick={() => { logout(); close(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium"
                  style={{ color: '#6b5e50' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#19130E' }}
                >
                  Sign In
                </Link>
                <Link to="/signup" onClick={close}
                  className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg text-[15px] font-black no-underline"
                  style={{ background: '#19130E', color: '#F9F8F3' }}
                >
                  Join Modern Selfdrive
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
