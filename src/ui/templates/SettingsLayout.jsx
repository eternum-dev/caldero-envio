import Header from '../Header/Header';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../atoms/Icon';

export default function SettingsLayout({ children, activeTab, onTabChange }) {
  const { user } = useAuth();

  const tabs = [
    { id: 'store', label: 'Local', icon: 'location' },
    { id: 'couriers', label: 'Repartidores', icon: 'user' },
    { id: 'pricing', label: 'Tarifas', icon: 'map' },
  ];

  return (
    <>
      <Header variant="auth" user={user} />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex space-x-6 border-b border-surface-low mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-secondary border-secondary'
                  : 'text-on-surface-variant border-transparent hover:text-on_surface'
              }`}
            >
              <Icon name={tab.icon} className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
        {children}
      </div>
    </>
  );
}