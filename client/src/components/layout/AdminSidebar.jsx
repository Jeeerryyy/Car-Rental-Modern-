import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ children }) => {
  const location = useLocation();

  const links = [
    { name: 'Analytics', path: '/admin/analytics', icon: 'bar_chart' },
    { name: 'Fleet Management', path: '/admin/fleet', icon: 'directions_car' },
    { name: 'Bookings', path: '/admin/bookings', icon: 'calendar_month' }
  ];

  return (
    <div className="flex bg-off min-h-[calc(100vh-72px)]">
      {/* Desktop sidebar (1024+) */}
      <aside className="hidden lg:flex w-[256px] flex-shrink-0 bg-dark text-white flex-col fixed h-[calc(100vh-72px)] top-[72px] left-0 z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">admin_panel_settings</span>
            Admin Portal
          </h2>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {links.map(link => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link key={link.name} to={link.path} aria-current={isActive ? 'page' : undefined} className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-colors no-underline ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors">
            <span className="material-symbols-outlined text-[18px]">help</span> Support Center
          </button>
        </div>
      </aside>

      {/* Tablet sidebar icon-only (768-1023) */}
      <aside className="hidden md:flex lg:hidden w-[64px] flex-shrink-0 bg-dark text-white flex-col fixed h-[calc(100vh-72px)] top-[72px] left-0 z-10">
        <div className="p-3 border-b border-gray-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-500 text-[24px]">admin_panel_settings</span>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 py-4 flex flex-col gap-1 items-center">
          {links.map(link => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link key={link.name} to={link.path} title={link.name} aria-current={isActive ? 'page' : undefined} className={`w-11 h-11 rounded-md flex items-center justify-center transition-colors no-underline ${isActive ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar (<768) */}
      <nav aria-label="Admin navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-border h-[64px] flex items-center justify-around">
        {links.map(link => {
          const isActive = location.pathname.includes(link.path);
          return (
            <Link key={link.name} to={link.path} aria-current={isActive ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-0.5 no-underline flex-1 h-full transition-colors ${isActive ? 'text-dark border-t-2 border-dark' : 'text-muted'}`}>
              <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
              <span className="text-[10px] font-semibold">{link.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className={`flex-1 p-4 md:p-8 ml-0 md:ml-[64px] lg:ml-[256px] pb-[80px] md:pb-8`}>
        {children}
      </main>
    </div>
  );
};

export default AdminSidebar;
