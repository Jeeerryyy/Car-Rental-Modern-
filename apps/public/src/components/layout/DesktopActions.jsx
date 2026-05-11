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
    <div className="hidden lg:flex items-center gap-6">
      <div className="flex items-center gap-3 pr-6 border-r border-border">
        <span className="flex items-center gap-2 text-[14px] font-medium text-dark">
          <PhoneIcon className="w-[18px] h-[18px]" />
          +91 87924 92717
        </span>
        <a href="https://wa.me/918792492717" target="_blank" rel="noopener noreferrer"
          className="flex items-center text-[#25D366] hover:opacity-80 transition-opacity" aria-label="Chat on WhatsApp">
          <WhatsAppIcon className="w-[18px] h-[18px]" />
        </a>
      </div>

      <div className="flex items-center gap-4">
        {customer ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-off hover:bg-gray-100 transition-all border border-border group"
            >
              <div className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-[12px] font-bold">
                {customer?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-[14.5px] font-bold text-dark max-w-[120px] truncate">
                {customer?.name || 'User'}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-muted transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl z-[110] overflow-hidden transition-all duration-300 transform origin-top-right ${
              isDropdownOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
              <div className="px-5 py-4 border-b border-border bg-off/50">
                <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-0.5">Account</p>
                <p className="text-[14px] font-bold text-dark truncate">{customer?.name || 'User'}</p>
                <p className="text-[12px] font-medium text-muted truncate">{customer?.email || 'No Email'}</p>
              </div>
              <div className="p-2">
                <Link 
                  to="/my-bookings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-bold text-dark hover:bg-off transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="text-[16px]">📋</span>
                  </div>
                  My Bookings
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-bold text-dark hover:bg-off transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-dark flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  Profile Settings
                </Link>
                <div className="my-1 border-t border-border mx-2" />
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100/50 text-red-600 flex items-center justify-center">
                    <span className="text-[16px]">🚪</span>
                  </div>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            to="/signin" 
            className="px-7 py-2.5 bg-accent text-dark text-[14.5px] font-bold rounded-btn hover:brightness-110 transition-all shadow-sm shadow-accent/20"
          >
            Log In
          </Link>
        )}
      </div>
    </div>
  );
}

