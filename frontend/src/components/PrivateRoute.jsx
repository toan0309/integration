import { Navigate } from 'react-router-dom';
import TokenStorage from '../utils/tokenStorage';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 */
function PrivateRoute({ children, requiredRoles = [] }) {
  const isAuthenticated = TokenStorage.isAuthenticated();
  const userRoles = TokenStorage.getUserRoles();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check roles if specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default PrivateRoute;
