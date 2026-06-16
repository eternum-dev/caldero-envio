import { Link } from 'react-router-dom';
import { Header, HeaderLogo, HeaderUserMenu } from '../Header';
import { ROUTES } from '../../utils/constants';
import Icon from '../atoms/Icon';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo to={ROUTES.LANDING} />
        <div className="flex items-center gap-3">
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
