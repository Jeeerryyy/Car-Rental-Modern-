export default function OwnerTopbar({ onMenuToggle }) {
  return (
    <>
      {/* Mobile topbar */}
      <header className="md:hidden flex justify-between items-center px-6 h-16 w-full sticky top-0 z-30 bg-surface text-primary border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span
            className="material-symbols-outlined cursor-pointer hover:text-primary-container transition-colors active:scale-95"
            onClick={onMenuToggle}
          >
            menu
          </span>
          <span className="font-headline-lg text-headline-lg font-medium">Modern Selfdrive</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined cursor-pointer text-secondary hover:text-primary-container transition-colors active:scale-95">notifications</span>
          <span className="material-symbols-outlined cursor-pointer text-secondary hover:text-primary-container transition-colors active:scale-95">settings</span>
          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center text-primary font-bold text-xs">
            MS
          </div>
        </div>
      </header>

      {/* Desktop topbar */}
      <header className="hidden md:flex justify-between items-center px-6 h-16 w-full sticky top-0 z-30 bg-surface border-b border-outline-variant">
        <div className="flex-1">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-0 transition-colors placeholder:text-on-surface-variant"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-secondary hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-low active:scale-95 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-secondary hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-low active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container border border-outline-variant cursor-pointer flex items-center justify-center text-primary font-bold text-xs">
            MS
          </div>
        </div>
      </header>
    </>
  );
}
