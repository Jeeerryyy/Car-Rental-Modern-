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
      <div className="flex items-center gap-3 pr-5" style={{ borderRight: '1px solid #D6D0C7' }}>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 text-[13px] font-semibold transition-colors duration-300 hover:text-[#A56A43]" style={{ color: '#121212' }}>
            <PhoneIcon className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            +91 90044 60634
          </span>
        </div>
        <a href="https://wa.me/919004460634" target="_blank" rel="noopener noreferrer"
          className="flex items-center no-underline transition-all duration-300 hover:scale-115 hover:drop-shadow-[0_2px_8px_rgba(37,211,102,0.4)]" style={{ color: '#25D366' }} aria-label="Chat on WhatsApp">
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      <div className="flex items-center gap-3">
        {customer ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 hover:scale-[1.03] hover:border-[#A56A43] hover:bg-[#E7E0D4]"
              style={{ borderColor: '#D6D0C7', background: 'rgba(214,208,199,0.4)', color: '#121212' }}
            >
              <UserIcon className="w-4 h-4 transition-transform duration-300" style={{ color: '#121212' }} />
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#5C5C5C' }} />
            </button>

            <div className={`absolute right-0 mt-3 w-56 rounded-xl z-[110] overflow-hidden transition-all duration-300 origin-top-right ${
              isDropdownOpen
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
              style={{ background: '#E7E0D4', border: '1px solid #DDE8DE', boxShadow: '0 12px 40px rgba(18,18,18,0.12)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #D6D0C7', background: 'rgba(214,208,199,0.4)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px]" style={{ color: '#5C5C5C' }}>Customer Account</p>
                <p className="text-[14px] font-black truncate mt-1" style={{ color: '#121212' }}>{customer?.name || 'User'}</p>
                <p className="text-[11px] font-medium truncate opacity-70" style={{ color: '#121212' }}>{customer?.email || 'No Email'}</p>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link
                  to="/my-bookings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold no-underline transition-all duration-200 hover:bg-white hover:translate-x-1"
                  style={{ color: '#121212' }}
                >
                  <span className="text-[14px]">📋</span>
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold no-underline transition-all duration-200 hover:bg-white hover:translate-x-1"
                  style={{ color: '#121212' }}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#A56A43]" />
                  Profile Settings
                </Link>
                <div className="my-1 mx-2" style={{ borderTop: '1px solid #D6D0C7' }} />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold text-left transition-all duration-200 hover:bg-red-50 hover:translate-x-1"
                  style={{ color: '#9C4B45' }}
                >
                  <span className="text-[14px]">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/signin" className="cssbuttons-io-button">
            Log In
            <div className="icon">
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
