import { useState, useRef, useEffect } from 'react';
import Label from '../atoms/Label';
import Icon from '../atoms/Icon';

export default function CourierSelect({ couriers = [], value, onChange, error, className = '' }) {
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (couriers.length === 1 && !initialized && !value) {
      setInitialized(true);
      onChange(couriers[0].id);
    }
  }, [couriers, initialized, value, onChange]);

  return (
    <div className={className}>
      <Label className="mb-1.5">Repartidor</Label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35 transition-colors cursor-pointer appearance-none"
        >
          <option value="" className="bg-surface-2">
            Seleccionar repartidor
          </option>
          {couriers.map(courier => (
            <option key={courier.id} value={courier.id} className="bg-surface-2">
              {courier.name} - {courier.phone}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <Icon name="chevronDown" className="w-4 h-4" />
        </span>
      </div>
      {error && <span className="text-[11px] text-danger mt-1 block">{error}</span>}
    </div>
  );
}
