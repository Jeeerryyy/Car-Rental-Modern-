import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import toast from 'react-hot-toast';

export default function CustomerSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = new URLSearchParams(location.search).get('returnTo') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(returnTo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-dark mb-6">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded focus:outline-none focus:border-accent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark text-white py-3 rounded font-semibold hover:bg-dark/90 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-muted">
            Don't have an account? <Link to="/signup" className="text-accent font-semibold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}