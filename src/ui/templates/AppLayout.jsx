import Header from '../Header/Header';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="auth" user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}