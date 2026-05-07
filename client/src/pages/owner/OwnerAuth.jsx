import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LockIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const OwnerAuth = () => {
  const { ownerLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await ownerLogin(formData);
    if (res.success) {
      toast.success('Owner access granted');
      navigate('/owner');
    } else {
      toast.error(res.error || 'Invalid owner credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="text-xl font-bold text-white tracking-tight">MODERN<span className="text-blue-500">DRIVE</span></span>
          </Link>
          <p className="text-gray-400 text-sm">Administrative access only</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
              <div className="relative">
                <input 
                  type="email" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="admin@moderndrive.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter Dashboard <LockIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-gray-500">
            <ShieldCheckIcon className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase tracking-widest">End-to-End Encryption Active</span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest">
          Authorized personnel only. All access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default OwnerAuth;
