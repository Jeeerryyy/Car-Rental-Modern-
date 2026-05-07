import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AuthGate({ children, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-[3px] border-dark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

export default function ProtectedRoute({ children }) {
  return <AuthGate>{children}</AuthGate>;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-[3px] border-dark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/owner/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
}
