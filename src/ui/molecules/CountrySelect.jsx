import Label from '../atoms/Label';
import Icon from '../atoms/Icon';

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'MX', name: 'México' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BR', name: 'Brasil' },
];

export default function CountrySelect({
  value = '',
  onChange,
  label = 'País',
  error,
  className = '',
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35 transition-colors cursor-pointer appearance-none"
        >
          <option value="" className="bg-surface-2">
            Seleccionar país
          </option>
          {COUNTRIES.map(country => (
            <option
              key={country.code}
              value={country.code}
              className="bg-surface-2"
            >
              {country.name}
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

export { COUNTRIES };
