import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FullPageSpinner } from './Spinner';

/** Only renders nested routes for logged-in users; everyone else is sent to /login. */
export default function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, notice: 'Please log in to continue.' }}
      />
    );
  }

  return <Outlet />;
}
