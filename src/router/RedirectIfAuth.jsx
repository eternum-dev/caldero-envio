import { Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

export default function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.hasCompletedOnboarding) {
    return <Navigate to={ROUTES.APP} replace />;
  }

  if (user && !user.hasCompletedOnboarding) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return children;
}