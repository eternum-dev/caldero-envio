import { Header, HeaderLogo, HeaderNav, HeaderUserMenu } from '../Header';
import { ROUTES } from '../../utils/constants';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <Header>
        <HeaderLogo to={ROUTES.LANDING} />
        <HeaderNav
          links={[
            { label: 'Calcular', to: ROUTES.APP },
            { label: 'Configuración', to: ROUTES.SETTINGS },
          ]}
        />
        <HeaderUserMenu />
      </Header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}