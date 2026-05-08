import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OwnerSidebar from './OwnerSidebar';
import OwnerTopbar from './OwnerTopbar';

export default function OwnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <OwnerSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
        <OwnerTopbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
