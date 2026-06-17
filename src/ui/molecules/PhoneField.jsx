import { useState, useEffect } from 'react';
import Label from '../atoms/Label';
import { COUNTRY_PHONES, combinePhone, stripDialCode } from '../../utils/phoneUtils';

/**
 * PhoneField — country code selector + phone number input.
 * Stores the full number with dial code (e.g. "+56912345678").
 * Syncs dial code automatically when `country` prop changes.
 */
export default function PhoneField({
  value = '',
  country = 'CL',
  onChange,
  label = 'Teléfono',
  error,
  required = false,
  className = '',
}) {
  const currentConfig = COUNTRY_PHONES.find(c => c.code === country) || COUNTRY_PHONES[1];

  const [dialCode, setDialCode] = useState(currentConfig.dial);
  const [localNumber, setLocalNumber] = useState('');

  // Sync dial code when country changes
  useEffect(() => {
    const config = COUNTRY_PHONES.find(c => c.code === country) || COUNTRY_PHONES[1];
    setDialCode(config.dial);
  }, [country]);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const config = COUNTRY_PHONES.find(c => c.code === country) || COUNTRY_PHONES[1];
      const local = stripDialCode(value, country);
      setLocalNumber(local);
      setDialCode(config.dial);
    }
  }, [value, country]);

  const handleLocalChange = e => {
    const raw = e.target.value.replace(/\D/g, '');
    setLocalNumber(raw);
    onChange(combinePhone(dialCode, raw));
  };

  const handleDialChange = e => {
    const newDial = e.target.value;
    setDialCode(newDial);
    onChange(combinePhone(newDial, localNumber));
  };

  return (
    <div className={className}>
      <Label required={required} className="mb-1.5">{label}</Label>
      <div className="flex gap-2">
        {/* Dial code selector */}
        <select
          value={dialCode}
          onChange={handleDialChange}
          className="bg-surface-2 border border-gold/18 rounded-sm px-2.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold/35 transition-colors cursor-pointer appearance-none min-w-[88px]"
        >
          {COUNTRY_PHONES.map(c => (
            <option key={c.code} value={c.dial} className="bg-surface-2">
              {c.flag} {c.dial}
            </option>
          ))}
        </select>

        {/* Local number input */}
        <input
          type="text"
          inputMode="numeric"
          value={localNumber}
          onChange={handleLocalChange}
          placeholder="9 1234 5678"
          className="flex-1 bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35 transition-colors"
        />
      </div>
      {error && (
        <span className="text-[11px] text-danger mt-1 block">{error}</span>
      )}
    </div>
  );
}
