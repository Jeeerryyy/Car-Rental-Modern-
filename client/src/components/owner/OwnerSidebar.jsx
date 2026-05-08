import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/owner/add-car', label: 'Add Car', icon: 'add_circle' },
  { path: '/owner/fleet', label: 'Manage Fleet', icon: 'directions_car' },
  { path: '/owner/bookings', label: 'Bookings', icon: 'calendar_today' },
  { path: '/owner/clients', label: 'Clients', icon: 'group' },
];

const bottomItems = [
  { path: '#', label: 'Support', icon: 'help_outline' },
  { path: '#', label: 'Account', icon: 'account_circle' },
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
        <div className="flex items-center gap-4 px-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-lg text-headline-lg font-bold">
            M
          </div>
          <div>
            <h1 className="font-headline-lg text-[18px] font-bold text-primary leading-tight">Modern Selfdrive</h1>
            <p className="font-body-sm text-body-sm text-secondary">Fleet Management</p>
          </div>
        </div>

        {/* New Booking CTA */}
        <button className="bg-primary-container text-on-primary font-body-md text-body-md rounded-full py-3 px-6 w-full flex items-center justify-center gap-2 hover:bg-[#333] transition-colors mb-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Booking
        </button>

        {/* Main nav */}
        <div className="flex-1 flex flex-col gap-1">
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

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant">
          {bottomItems.map(({ path, label, icon }) => (
            <a
              key={label}
              href={path}
              className="flex items-center gap-3 text-secondary px-4 py-2.5 hover:bg-surface-container-low transition-all duration-200 rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="font-body-sm text-body-sm">{label}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
