import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MenuIcon, XIcon, CarIcon, CalendarIcon, UsersIcon, 
  LogOutIcon, LayoutIcon, TagIcon
} from '../ui/Icons';
import socket, { connectSocket, disconnectSocket } from '../../services/socket';

const navItems = [
  { path: '/owner', label: 'Dashboard', icon: LayoutIcon, exact: true },
  { path: '/owner/bookings', label: 'Bookings', icon: CalendarIcon },
  { path: '/owner/fleet', label: 'Fleet Manager', icon: CarIcon },
  { path: '/owner/promos', label: 'Promo Codes', icon: TagIcon },
  { path: '/owner/customers', label: 'Customers', icon: UsersIcon },
];

function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      connectSocket();
      socket.emit('join-owner-room');
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[SOCKET] Connection failed, falling back to polling.');
      }
    }

    return () => {
      try {
        disconnectSocket();
      } catch (err) {}
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#111] text-white h-16 flex items-center justify-between px-4">
        <span className="font-bold tracking-tight">Modern Drive</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[240px] bg-[#111] text-white flex-col fixed h-screen top-0 left-0 z-40 shadow-xl">
        <div className="p-6 mb-4">
          <h2 className="text-xl font-bold tracking-tight">Owner CRM</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Management System</p>
        </div>
        
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.name || 'Owner'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-xs font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-16 left-0 right-0 bg-[#111] text-white z-45 transform transition-transform duration-300 ${sidebarOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium no-underline ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 mt-4 border-t border-white/5">
            <LogOutIcon className="w-5 h-5" /> Logout
          </button>
        </nav>
      </div>

      <main className="flex-1 lg:ml-[240px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default OwnerLayout;