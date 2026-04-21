import Label from '../atoms/Label'

export default function CourierSelect({
  couriers = [],
  value,
  onChange,
  error,
  className = '',
}) {
  return (
    <div className={className}>
      <Label>Repartidor</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Seleccionar repartidor</option>
        {couriers.map((courier) => (
          <option key={courier.id} value={courier.id}>
            {courier.name} - {courier.phone}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}