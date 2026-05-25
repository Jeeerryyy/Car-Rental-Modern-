import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useOwnerAuth } from '../../context/OwnerAuthContext.jsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', ownerOnly: true },
  { path: '/fleet/add', label: 'Add Car', icon: 'directions_car', ownerOnly: true },
  { path: '/fleet/add-bike', label: 'Add Bike', icon: 'two_wheeler', ownerOnly: true },
  { path: '/fleet', label: 'Manage Fleet', icon: 'view_list', ownerOnly: true },
  { path: '/bookings', label: 'Bookings', icon: 'list_alt' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar_today', ownerOnly: true },
  { path: '/clients', label: 'Clients', icon: 'group', ownerOnly: true },
  { path: '/reports', label: 'Reports', icon: 'analytics', ownerOnly: true },
  { path: '/promos', label: 'Promo Codes', icon: 'sell', ownerOnly: true },
  { path: '/staff', label: 'Staff Management', icon: 'badge', ownerOnly: true },
  { path: '/settings', label: 'Settings', icon: 'settings', ownerOnly: true },
];

const bottomItems = [
  { path: '/support', label: 'Support', icon: 'help_outline', ownerOnly: true },
  { path: '/profile', label: 'Account', icon: 'account_circle' },
];

export default function OwnerSidebar({ mobileOpen, onClose }) {
  const { isOwner, logout } = useOwnerAuth();

  const filteredNavItems = navItems.filter(item => !item.ownerOnly || isOwner);

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
          className="bg-primary text-white rounded-xl py-3 px-6 w-full flex items-center justify-center gap-2 hover:bg-black transition-all mb-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-black/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Booking
        </Link>


        {/* Main nav - Scrollable area */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
          <div className="flex flex-col gap-1">
            {filteredNavItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                end={path === '/fleet'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'text-primary font-bold bg-white shadow-sm border border-black/5'
                      : 'text-on-surface-variant hover:bg-black/5'
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

        <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant">
          {bottomItems.filter(item => !item.ownerOnly || isOwner).map(({ path, label, icon }) => (
            <Link
              key={label}
              to={path}
              className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-black/5 transition-all duration-200 rounded-xl"
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="font-body-sm text-body-sm">{label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-500 px-4 py-3 hover:bg-red-50 transition-all duration-200 rounded-xl w-full text-left mt-2 font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-sm text-body-sm">Logout</span>
          </button>
        </div>

      </nav>
    </>
  );
}
