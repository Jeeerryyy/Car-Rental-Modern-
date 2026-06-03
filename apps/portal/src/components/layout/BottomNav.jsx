import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: 'home', ownerOnly: true },
  { path: '/fleet', label: 'Fleet', icon: 'directions_car', ownerOnly: true },
  { path: '/bookings/new', label: 'Add', icon: 'add', primary: true },
  { path: '/bookings', label: 'Bookings', icon: 'list_alt' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar_month', ownerOnly: true },
];

export default function BottomNav() {
  let mouseX = useMotionValue(Infinity);
  const { isOwner } = (function() {
    try {
      const stored = localStorage.getItem('owner');
      const user = stored ? JSON.parse(stored) : null;
      return { isOwner: user?.role === 'owner' };
    } catch {
      return { isOwner: true };
    }
  })();

  const filteredItems = navItems.filter(item => !item.ownerOnly || isOwner);

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe bg-white/95 border-t border-black/5 backdrop-blur-2xl"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <div className="flex h-[64px] items-center justify-around max-w-lg mx-auto px-4">
        {filteredItems.map((item) => (
          <DockIcon key={item.path} mouseX={mouseX} item={item} />
        ))}
      </div>
    </nav>
  );
}

function DockIcon({ mouseX, item }) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale effect: icons grow slightly on hover
  let widthSync = useTransform(distance, [-100, 0, 100], [40, 52, 40]);
  let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <NavLink
      to={item.path}
      className="flex flex-col items-center justify-center no-underline group"
    >
      {({ isActive }) => (
        <motion.div
          ref={ref}
          style={{ width, height: width }}
          className={`flex items-center justify-center rounded-2xl transition-colors ${
            item.primary 
              ? 'bg-[#141414] text-white shadow-lg shadow-black/10' 
              : isActive 
                ? 'bg-black/5 text-[#A56A43]' 
                : 'bg-transparent text-gray-500 hover:bg-black/5'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]"
            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {item.icon}
          </span>
        </motion.div>
      )}
    </NavLink>
  );
}
