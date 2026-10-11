import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FullPageSpinner } from './Spinner';

/**
 * For /login and /register. Logged-in users are redirected away, back to the page they
 * originally wanted (set by ProtectedRoute) or to the gallery.
 */
export default function GuestRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;

  if (user) {
    const destination = location.state?.from?.pathname || '/templates';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
