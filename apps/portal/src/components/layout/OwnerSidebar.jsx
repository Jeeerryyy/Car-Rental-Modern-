import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/fleet/add', label: 'Add Car', icon: 'directions_car' },
  { path: '/fleet/add-bike', label: 'Add Bike', icon: 'two_wheeler' },
  { path: '/fleet', label: 'Manage Fleet', icon: 'view_list' },
  { path: '/bookings', label: 'Bookings', icon: 'list_alt' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar_today' },
  { path: '/clients', label: 'Clients', icon: 'group' },
  { path: '/promos', label: 'Promo Codes', icon: 'sell' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const bottomItems = [
  { path: '/support', label: 'Support', icon: 'help_outline' },
  { path: '/profile', label: 'Account', icon: 'account_circle' },
];

export default function OwnerSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`
          fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest
          border-r border-outline-variant py-8 px-4 z-50
          flex flex-col gap-6 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 mb-6">
          <img src="/irck-removebg-preview.png" alt="Logo" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-none" style={{ color: '#19130E' }}>modern</span>
            <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#B67C3D' }}>self drive</span>
          </div>
        </div>

        {/* New Booking CTA */}
        <Link 
          to="/bookings/new"
          className="bg-white border border-gray-200 text-dark rounded-xl py-3 px-6 w-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-all mb-4 text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] text-muted">add</span>
          New Booking
        </Link>

        {/* Main nav - Scrollable area */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
          <div className="flex flex-col gap-1">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'text-primary font-bold bg-surface-container'
                      : 'text-secondary hover:bg-surface-container-low'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {icon}
                    </span>
                    <span className="font-body-sm text-body-sm">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant">
          {bottomItems.map(({ path, label, icon }) => (
            <Link
              key={label}
              to={path}
              className="flex items-center gap-3 text-secondary px-4 py-2.5 hover:bg-surface-container-low transition-all duration-200 rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="font-body-sm text-body-sm">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
