import { Link, useNavigate } from 'react-router-dom';
import { Header, HeaderLogo, HeaderUserMenu } from '../Header';
import { ROUTES } from '../../utils/constants';
import Icon from '../atoms/Icon';
import CreditBadge from '../atoms/CreditBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useCredits(user?.uid ?? null);

  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo to={ROUTES.app} />
        <div className="flex items-center gap-3">
          {user && (
            <CreditBadge
              balance={balance}
              onClick={() => navigate(ROUTES.SETTINGS_CALDEROS)}
            />
          )}
          <Link
            to={ROUTES.LANDING}
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors"
          >
            <Icon name="home" className="w-5 h-5" />
          </Link>
          <HeaderUserMenu />
        </div>
      </Header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-7 py-6">{children}</main>
    </div>
  );
}
