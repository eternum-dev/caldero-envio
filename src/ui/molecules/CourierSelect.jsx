import Label from '../atoms/Label';
import Icon from '../atoms/Icon';

export default function CourierSelect({ couriers = [], value, onChange, error, className = '' }) {
  return (
    <div className={className}>
      <Label className="mb-2">Repartidor</Label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 bg-surface-high rounded-md text-white placeholder:text-primary-fixed_dim focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer appearance-none"
        >
          <option value="" className="bg-surface-medium">
            Seleccionar repartidor
          </option>
          {couriers.map(courier => (
            <option key={courier.id} value={courier.id} className="bg-surface-medium">
              {courier.name} - {courier.phone}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on_surface_variant">
          <Icon name="chevronDown" className="w-5 h-5" />
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
