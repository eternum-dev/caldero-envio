import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuth from './RedirectIfAuth';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import App from '../pages/App';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export default function AppRouter() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path={ROUTES.LANDING}
        element={
          <RedirectIfAuth>
            <Landing />
          </RedirectIfAuth>
        }
      />
      <Route
        path={ROUTES.LOGIN}
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <RedirectIfAuth>
            <Register />
          </RedirectIfAuth>
        }
      />
      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.APP}
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} />} />
    </Routes>
  );
}
