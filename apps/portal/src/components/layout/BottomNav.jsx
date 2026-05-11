import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/fleet', label: 'Fleet', icon: 'directions_car' },
  { path: '/bookings/new', label: 'Add', icon: 'add_circle', primary: true },
  { path: '/bookings', label: 'Bookings', icon: 'list_alt' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar_month' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-outline-variant z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, label, icon, primary }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive ? 'text-primary' : 'text-secondary'
              } ${primary ? '-translate-y-4' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`${primary ? 'w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white' : ''}`}>
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {icon}
                  </span>
                </div>
                {!primary && <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>}
                {isActive && !primary && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
