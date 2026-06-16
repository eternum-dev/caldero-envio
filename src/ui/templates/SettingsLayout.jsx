import { Link, useNavigate } from 'react-router-dom';
import { Header, HeaderLogo, HeaderUserMenu } from '../Header';
import { ROUTES } from '../../utils/constants';
import Icon from '../atoms/Icon';

export default function SettingsLayout({ children, activeTab, onTabChange }) {
  const navigate = useNavigate();
  const tabs = [
    { id: 'store', label: 'Local', icon: 'location' },
    { id: 'couriers', label: 'Repartidores', icon: 'user' },
    { id: 'pricing', label: 'Tarifas', icon: 'truck' },
  ];

  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo to={ROUTES.APP} />
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
      <main className="max-w-7xl mx-auto w-full px-7 py-6">
        <button
          onClick={() => navigate(ROUTES.APP)}
          className="flex items-center gap-2 text-muted hover:text-ink transition-colors mb-6 font-sans text-xs underline underline-offset-2"
        >
          <Icon name="chevronLeft" className="w-4 h-4" />
          Calcular
        </button>
        <div className="flex gap-8 border-b border-gold/18 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 font-sans text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'text-gold border-gold'
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {children}
      </main>
    </div>
  );
}
