import { Navigate } from 'react-router-dom';
import TokenStorage from '../utils/tokenStorage';

/**
 * PublicRoute Component
 * Allows public access but redirects to dashboard if already authenticated
 */
function PublicRoute({ children }) {
  const isAuthenticated = TokenStorage.isAuthenticated();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
