import Icon from '../atoms/Icon'

export default function MapPreview({ src, className = '' }) {
  if (!src) {
    return (
      <div className={`bg-surface-container rounded-md flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
        <div className="text-center text-on-surface-variant">
          <Icon name="map" className="w-12 h-12 mx-auto mb-2 text-primary-fixed_dim" />
          <p className="text-sm">Sin mapa disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-md overflow-hidden ${className}`}>
      <img src={src} alt="Mapa de ruta" className="w-full h-full object-cover" />
    </div>
  )
}