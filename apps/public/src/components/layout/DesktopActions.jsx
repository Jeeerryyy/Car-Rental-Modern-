import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, WhatsAppIcon, UserIcon, ChevronDownIcon } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';

export default function DesktopActions() {
  const { customer, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-5">
      <div className="flex items-center gap-3 pr-5" style={{ borderRight: '1px solid rgba(182,124,61,0.15)' }}>
        <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: '#19130E' }}>
          <PhoneIcon className="w-4 h-4" />
          +91 87924 92717
        </span>
        <a href="https://wa.me/918792492717" target="_blank" rel="noopener noreferrer"
          className="flex items-center no-underline" style={{ color: '#25D366' }} aria-label="Chat on WhatsApp">
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      <div className="flex items-center gap-3">
        {customer ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ borderColor: 'rgba(182,124,61,0.15)', background: 'rgba(220,207,186,0.4)', color: '#19130E' }}
            >
              <UserIcon className="w-4 h-4" style={{ color: '#19130E' }} />
              <ChevronDownIcon className={`w-3.5 h-3.5 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#6b5e50' }} />
            </button>

            <div className={`absolute right-0 mt-2 w-52 rounded-xl z-[110] overflow-hidden ${
              isDropdownOpen
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
              style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)', boxShadow: '0 1px 3px rgba(25,19,14,0.06)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(182,124,61,0.15)', background: 'rgba(220,207,186,0.5)' }}>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b5e50' }}>Account</p>
                <p className="text-[13px] font-bold truncate" style={{ color: '#19130E' }}>{customer?.name || 'User'}</p>
                <p className="text-[11px] font-medium truncate" style={{ color: '#6b5e50' }}>{customer?.email || 'No Email'}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/my-bookings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold no-underline"
                  style={{ color: '#19130E' }}
                >
                  <span className="text-[14px]">📋</span>
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold no-underline"
                  style={{ color: '#19130E' }}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Profile Settings
                </Link>
                <div className="my-1 mx-2" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }} />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold text-left"
                  style={{ color: '#b91c1c' }}
                >
                  <span className="text-[14px]">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/signin"
            className="px-5 py-2 text-[13px] font-bold rounded-full no-underline"
            style={{ background: '#19130E', color: '#F9F8F3', border: '1px solid #19130E' }}
          >
            Log In
          </Link>
        )}
      </div>
    </div>
  );
}
