import Label from '../atoms/Label';

export default function CourierSelect({ couriers = [], value, onChange, error, className = '' }) {
  return (
    <div className={className}>
      <Label>Repartidor</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-surface-container-highest rounded-md text-on_surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
      >
        <option value="" className="bg-surface-container">
          Seleccionar repartidor
        </option>
        {couriers.map(courier => (
          <option key={courier.id} value={courier.id} className="bg-surface-container">
            {courier.name} - {courier.phone}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
