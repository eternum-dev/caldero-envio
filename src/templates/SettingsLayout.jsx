import Icon from '../atoms/Icon'

export default function SettingsLayout({ children, activeTab, onTabChange }) {
  const tabs = [
    { id: 'store', label: 'Local', icon: 'location' },
    { id: 'couriers', label: 'Repartidores', icon: 'user' },
    { id: 'pricing', label: 'Tarifas', icon: 'map' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Configuración
      </h2>

      <div className="flex space-x-4 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={tab.icon} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {children}
    </div>
  )
}