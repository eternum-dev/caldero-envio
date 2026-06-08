import { Header, HeaderLogo, HeaderUserMenu } from '../Header';
import { ROUTES } from '../../utils/constants';
import FooterNav from '../organisms/FooterNav';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo to={ROUTES.LANDING} />
        <HeaderUserMenu />
      </Header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-7 py-6">{children}</main>
      <FooterNav />
    </div>
  );
}
