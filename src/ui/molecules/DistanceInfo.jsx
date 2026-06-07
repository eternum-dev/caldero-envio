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
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      <div className="bg-surface-2 border border-gold/18 rounded-sm p-2.5 flex flex-col items-center gap-1 text-center">
        <Icon name="location" className="w-4 h-4 text-gold" />
        <span className="font-sans text-xs text-muted">Distancia</span>
        <span className="font-sans text-sm font-semibold text-ink">{distance ? formatDistance(distance) : '-'}</span>
      </div>
      <div className="bg-surface-2 border border-gold/18 rounded-sm p-2.5 flex flex-col items-center gap-1 text-center">
        <Icon name="clock" className="w-4 h-4 text-gold" />
        <span className="font-sans text-xs text-muted">Tiempo de ida</span>
        <span className="font-sans text-sm font-semibold text-ink">{time ? formatTime(time) : '-'}</span>
      </div>
      {totalTime !== null && totalTime !== undefined ? (
        <div className="bg-surface-2 border border-gold/18 rounded-sm p-2.5 flex flex-col items-center gap-1 text-center">
          <Icon name="clock" className="w-4 h-4 text-gold" />
          <span className="font-sans text-xs text-muted">Tiempo total</span>
          <span className="font-sans text-sm font-semibold text-ink">{formatTime(totalTime)}</span>
        </div>
      ) : (
        <div className="bg-surface-2 border border-gold/18 rounded-sm p-2.5 flex flex-col items-center gap-1 text-center">
          <span className="font-sans text-xs text-muted">—</span>
        </div>
      )}
    </div>
  );
}
