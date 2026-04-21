import Icon from '../atoms/Icon'

export default function DistanceInfo({ distance, time, className = '' }) {
  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  const formatTime = (min) => {
    if (min < 60) return `${Math.round(min)} min`
    const hours = Math.floor(min / 60)
    const mins = Math.round(min % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <div className={`flex items-center gap-4 text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        <Icon name="location" className="w-4 h-4" />
        <span className="text-sm font-medium">{distance ? formatDistance(distance) : '-'}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">{time ? formatTime(time) : '-'}</span>
      </div>
    </div>
  )
}