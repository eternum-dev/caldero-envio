import Label from '../atoms/Label';
import Icon from '../atoms/Icon';

const CITIES_BY_COUNTRY = {
  AR: [
    { code: 'BA', name: 'Buenos Aires' },
    { code: 'CBA', name: 'Córdoba' },
    { code: 'ROS', name: 'Rosario' },
    { code: 'MDZ', name: 'Mendoza' },
    { code: 'TUC', name: 'Tucumán' },
    { code: 'LP', name: 'La Plata' },
  ],
  CL: [
    { code: 'SCL', name: 'Santiago' },
    { code: 'VAL', name: 'Valparaíso' },
    { code: 'CON', name: 'Concepción' },
    { code: 'TLC', name: 'Talca' },
    { code: 'ARC', name: 'Arica' },
  ],
  CO: [
    { code: 'BGTA', name: 'Bogotá' },
    { code: 'MDE', name: 'Medellín' },
    { code: 'CLO', name: 'Cali' },
    { code: 'BQL', name: 'Barranquilla' },
  ],
  MX: [
    { code: 'CDMX', name: 'Ciudad de México' },
    { code: 'GDL', name: 'Guadalajara' },
    { code: 'MTY', name: 'Monterrey' },
    { code: 'PUE', name: 'Puebla' },
  ],
  PE: [
    { code: 'LIM', name: 'Lima' },
    { code: 'AQP', name: 'Arequipa' },
    { code: 'TRU', name: 'Trujillo' },
  ],
  UY: [
    { code: 'MVD', name: 'Montevideo' },
    { code: 'PSO', name: 'Punta del Este' },
    { code: 'SLA', name: 'Salto' },
  ],
  PY: [
    { code: 'ASU', name: 'Asunción' },
    { code: 'CDE', name: 'Ciudad del Este' },
  ],
  BO: [
    { code: 'LPZ', name: 'La Paz' },
    { code: 'SCZ', name: 'Santa Cruz' },
    { code: 'CBBA', name: 'Cochabamba' },
  ],
  EC: [
    { code: 'UIO', name: 'Quito' },
    { code: 'GYE', name: 'Guayaquil' },
    { code: 'CUE', name: 'Cuenca' },
  ],
  BR: [
    { code: 'BSB', name: 'Brasília' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'BH', name: 'Belo Horizonte' },
  ],
};

export default function CitySelect({
  value = '',
  onChange,
  country,
  label = 'Ciudad',
  error,
  className = '',
}) {
  const cities = country ? CITIES_BY_COUNTRY[country] || [] : [];

  return (
    <div className={className}>
      <Label className="mb-2">{label}</Label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={!country}
          className="w-full px-4 py-3 pr-10 bg-surface-high rounded-md text-white placeholder:text-primary-fixed_dim focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="bg-surface-medium">
            {country ? 'Seleccionar ciudad' : 'Selecciona un país primero'}
          </option>
          {cities.map(city => (
            <option key={city.code} value={city.code} className="bg-surface-medium">
              {city.name}
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