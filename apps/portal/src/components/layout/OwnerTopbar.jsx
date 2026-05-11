import { Link } from 'react-router-dom';

export default function OwnerTopbar({ onMenuToggle }) {

  return (
    <>
      {/* Mobile topbar */}
      <header className="md:hidden flex justify-between items-center px-6 h-16 w-full sticky top-0 z-30 bg-white text-dark border-b border-border">
        <div className="flex items-center gap-4">
          <span
            className="material-symbols-outlined cursor-pointer hover:text-muted transition-colors active:scale-95"
            onClick={onMenuToggle}
          >
            menu
          </span>
          <span className="font-display font-black tracking-tighter text-lg uppercase">Modern Drive</span>
        </div>
        <div className="flex items-center gap-3 relative">
          <Link to="/notifications" className="material-symbols-outlined text-muted hover:text-dark transition-colors">notifications</Link>
        </div>
      </header>

      {/* Desktop topbar */}
      <header className="hidden md:flex justify-between items-center px-8 h-20 w-full sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex-1">
          <div className="relative max-w-sm group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-dark transition-colors">search</span>
            <input
              className="w-full bg-off/50 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-dark focus:bg-white focus:border-border transition-all outline-none"
              placeholder="Search fleet, bookings, or clients..."
              type="text"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6 relative">
          <Link to="/notifications" className="text-muted hover:text-dark transition-colors p-2 rounded-xl hover:bg-off active:scale-95 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </header>
    </>
  );
}
