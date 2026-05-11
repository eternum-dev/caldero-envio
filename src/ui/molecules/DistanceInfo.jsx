import Icon from '../atoms/Icon';

export default function DistanceInfo({ distance, time, totalTime = null, className = '' }) {
  const formatDistance = km => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = min => {
    if (min < 60) return `${Math.round(min)} min`;
    const hours = Math.floor(min / 60);
    const mins = Math.round(min % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`flex items-center gap-6 text-on-surface-variant ${className}`}>
      <div className="flex items-center gap-2">
        <Icon name="location" className="w-4 h-4 text-primary" />
        <span className="text-xs text-on-surface-variant">Distancia</span>
        <span className="text-sm font-medium">{distance ? formatDistance(distance) : '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="clock" className="w-4 h-4 text-primary" />
        <span className="text-xs text-on-surface-variant">Tiempo de ida</span>
        <span className="text-sm font-medium">{time ? formatTime(time) : '-'}</span>
      </div>
      {totalTime !== null && totalTime !== undefined && (
        <div className="flex items-center gap-2">
          <Icon name="clock" className="w-4 h-4 text-primary" />
          <span className="text-xs text-on-surface-variant">Tiempo total</span>
          <span className="text-sm font-medium">{formatTime(totalTime)}</span>
        </div>
      )}
    </div>
  );
}
