import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// require: 'auth' | 'brand' | 'admin'
export default function ProtectedRoute({ children, require = 'auth' }) {
  const { user, isBrandApproved, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile py-space-4xl text-center text-on-surface-variant">
        Đang tải...
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (require === 'brand' && !isBrandApproved && !isAdmin) return <Navigate to="/brand/dang-ky" replace />;
  if (require === 'admin' && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
