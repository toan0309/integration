import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TokenStorage from '../utils/tokenStorage';

function PrivateRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="spinner spinner-primary" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRoles.length > 0) {
    const userRoles = TokenStorage.getUserRoles();
    const hasAccess = requiredRoles.some(r => userRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default PrivateRoute;
