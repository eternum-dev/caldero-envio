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
    <div className={`grid grid-cols-3 gap-4 text-on-surface-variant ${className}`}>
      <div className="flex flex-col items-center text-center">
        <Icon name="location" className="w-5 h-5 text-secondary mb-1" />
        <span className="text-xs text-on-surface-variant">Distancia</span>
        <span className="text-lg font-bold">{distance ? formatDistance(distance) : '-'}</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <Icon name="clock" className="w-5 h-5 text-secondary mb-1" />
        <span className="text-xs text-on-surface-variant">Tiempo de ida</span>
        <span className="text-lg font-bold">{time ? formatTime(time) : '-'}</span>
      </div>
      {totalTime !== null && totalTime !== undefined && (
        <div className="flex flex-col items-center text-center">
          <Icon name="clock" className="w-5 h-5 text-secondary mb-1" />
          <span className="text-xs text-on-surface-variant">Tiempo total</span>
          <span className="text-lg font-bold">{formatTime(totalTime)}</span>
        </div>
      )}
    </div>
  );
}
