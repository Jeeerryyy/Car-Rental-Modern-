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
        style={{ 
          background: 'rgba(18,18,18,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }} 
        onClick={close} 
        aria-hidden="true" 
      />

      <div id="mobile-menu" ref={drawerRef}
        role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined} aria-label="Mobile navigation"
        className={`fixed left-4 right-4 z-[95] lg:hidden overflow-hidden rounded-2xl transition-all duration-300 ease-in-out ${
          open ? 'max-h-[100vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 pointer-events-none -translate-y-2'
        }`}
        style={{
          top: '84px',
          background: '#E7E0D4',
          border: '1px solid #DDE8DE',
          boxShadow: '0 12px 40px rgba(18,18,18, 0.12)',
        }}
      >
        <nav className="p-5 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ name, path }) => {
            const active = pathname === path;
            return (
              <Link key={name} to={path} aria-current={active ? 'page' : undefined} onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] no-underline mobile-menu-item-anim"
                style={{
                  color: active ? '#A56A43' : '#121212',
                  fontWeight: active ? 700 : 500,
                  background: active ? 'rgba(182,124,61,0.08)' : 'transparent',
                }}
              >
                {name}
              </Link>
            );
          })}

          <hr className="mobile-menu-item-anim" style={{ border: 'none', borderTop: '1px solid #D6D0C7', margin: '8px 0' }} />

          <div className="flex items-center gap-3 px-4 py-3 mobile-menu-item-anim">
            <PhoneIcon className="w-4 h-4" style={{ color: '#A56A43' }} />
            <div className="flex flex-col">
              <a href="tel:+919004460634" className="text-[14px] font-medium no-underline" style={{ color: '#121212' }}>+91 90044 60634</a>
            </div>
          </div>

          <a href="https://wa.me/919004460634" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium no-underline mobile-menu-item-anim"
            style={{ color: '#25D366' }}
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>

          <hr className="mobile-menu-item-anim" style={{ border: 'none', borderTop: '1px solid #D6D0C7', margin: '8px 0' }} />

          <div className="flex flex-col gap-1 mobile-menu-item-anim">
            {customer ? (
              <>
                <Link to="/my-bookings" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#121212' }}
                >
                  <UserIcon className="w-5 h-5" style={{ color: '#A56A43' }} />
                  My Bookings
                </Link>
                <Link to="/profile" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#121212' }}
                >
                  {customer.name}
                </Link>
                <button onClick={() => { logout(); close(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium"
                  style={{ color: '#5C5C5C' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold no-underline"
                  style={{ color: '#121212' }}
                >
                  Sign In
                </Link>
                <Link to="/signup" onClick={close}
                  className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg text-[15px] font-black no-underline"
                  style={{ background: '#121212', color: '#F4F1EA' }}
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
