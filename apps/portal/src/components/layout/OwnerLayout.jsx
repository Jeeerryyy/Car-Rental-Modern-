import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OwnerSidebar from './OwnerSidebar';
import OwnerTopbar from './OwnerTopbar';

export default function OwnerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <OwnerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        <OwnerTopbar onMenuToggle={() => setMobileOpen(prev => !prev)} />
        <main className="flex-1 p-4 md:p-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
