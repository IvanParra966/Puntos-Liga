import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';

export default function ProtectedRoute({
  children,
  requiredPermission = null,
}) {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}