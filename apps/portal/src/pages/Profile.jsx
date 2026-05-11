import { useOwnerAuth } from '../context/OwnerAuthContext';

export default function Profile() {
  const { user, logout } = useOwnerAuth();

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto w-full animate-in fade-in duration-700">
      <div className="mb-12">
        <h2 className="text-3xl font-black text-dark tracking-tighter">Account Management</h2>
        <p className="text-muted font-medium mt-1">Review your administrative identity and session security.</p>
      </div>

      <div className="bg-white border border-border rounded-[32px] overflow-hidden">
        {/* Profile Header */}
        <div className="p-10 flex flex-col md:flex-row items-center gap-10 border-b border-border bg-off/20">
          <div className="w-24 h-24 rounded-full bg-dark text-white flex items-center justify-center font-black text-3xl shrink-0">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-dark tracking-tight">{user?.name || 'Platform Owner'}</h3>
            <p className="text-muted font-bold text-sm mt-0.5">{user?.email}</p>
            <div className="inline-flex mt-4 px-3 py-1 bg-dark text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              System Administrator
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Full Legal Name</label>
                <p className="text-sm font-black text-dark">{user?.name || '—'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Registered Email</label>
                <p className="text-sm font-black text-dark">{user?.email || '—'}</p>
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Contact Phone</label>
                <p className="text-sm font-black text-dark">{user?.phone || '—'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Account Created</label>
                <p className="text-sm font-black text-dark">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
           </div>
        </div>

        {/* Security Footer */}
        <div className="p-10 bg-off/30 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex gap-4 text-muted">
              <span className="material-symbols-outlined text-[20px]">security</span>
              <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed max-w-xs">
                Your account is protected by industry standard encryption and secure session tokens.
              </p>
           </div>
           <button 
             onClick={logout}
             className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all"
           >
             End Session
           </button>
        </div>
      </div>
    </div>
  );
}
