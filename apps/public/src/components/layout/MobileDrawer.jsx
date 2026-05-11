import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, WhatsAppIcon, UserIcon } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';

export default function MobileDrawer({ open, close, drawerRef, pathname, NAV_LINKS }) {
  const { customer, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 top-[72px] bg-black/40 z-[90] lg:hidden" onClick={close} aria-hidden="true" />
      )}

      <div id="mobile-menu" ref={drawerRef}
        role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined} aria-label="Mobile navigation"
        className={`fixed top-[72px] left-0 right-0 bg-white z-[95] lg:hidden border-b border-border shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="p-6 flex flex-col gap-2" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ name, path }) => {
            const active = pathname === path;
            return (
              <Link key={name} to={path} aria-current={active ? 'page' : undefined} onClick={close}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] transition-colors no-underline ${
                  active ? 'bg-off font-bold text-accent' : 'font-medium text-text hover:bg-off hover:text-accent'
                }`}>
                {name}
              </Link>
            );
          })}

          <hr className="border-border my-3" />

          <div className="flex items-center gap-3 px-4 py-3">
            <PhoneIcon className="w-[18px] h-[18px] text-accent" />
            <a href="tel:+918792492717" className="text-[14px] font-medium text-text no-underline">+91 87924 92717</a>
          </div>

          <a href="https://wa.me/918792492717" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-[#25D366] hover:bg-green-50 transition-colors no-underline">
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>

          <hr className="border-border my-3" />

          <div className="flex flex-col gap-2">
            {customer ? (
              <>
                <Link to="/my-bookings" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-text hover:bg-off no-underline">
                  <UserIcon className="w-5 h-5 text-accent" />
                  My Bookings
                </Link>
                <Link to="/profile" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-text hover:bg-off no-underline">
                  {customer.name}
                </Link>
                <button onClick={() => { logout(); close(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-muted hover:bg-off hover:text-text">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-text hover:bg-off no-underline">
                  Sign In
                </Link>
                <Link to="/signup" onClick={close}
                  className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-[15px] font-black bg-accent text-dark shadow-xl shadow-accent/10 no-underline">
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
