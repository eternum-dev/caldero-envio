import Icon from '../atoms/Icon'

export default function MapPreview({ src, className = '' }) {
  if (!src) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
        <div className="text-center text-gray-400">
          <Icon name="map" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Sin mapa disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <img src={src} alt="Mapa de ruta" className="w-full h-full object-cover" />
    </div>
  )
}