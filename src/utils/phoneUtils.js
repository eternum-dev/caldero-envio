/**
 * Phone number utilities — country codes and validation per country.
 */

/**
 * Country phone data: dial code, flag emoji, name, and validation rules.
 */
export const COUNTRY_PHONES = [
  { code: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina', minDigits: 10, maxDigits: 11 },
  { code: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile', minDigits: 9, maxDigits: 9 },
  { code: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia', minDigits: 10, maxDigits: 10 },
  { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'México', minDigits: 10, maxDigits: 10 },
  { code: 'PE', dial: '+51', flag: '🇵🇪', name: 'Perú', minDigits: 9, maxDigits: 9 },
  { code: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay', minDigits: 8, maxDigits: 8 },
  { code: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay', minDigits: 9, maxDigits: 10 },
  { code: 'BO', dial: '+591', flag: '🇧🇴', name: 'Bolivia', minDigits: 8, maxDigits: 8 },
  { code: 'EC', dial: '+593', flag: '🇪🇨', name: 'Ecuador', minDigits: 9, maxDigits: 9 },
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brasil', minDigits: 10, maxDigits: 11 },
];

/**
 * Get phone info for a country code.
 */
export function getPhoneConfig(countryCode) {
  return COUNTRY_PHONES.find(c => c.code === countryCode) || COUNTRY_PHONES[1]; // default CL
}

/**
 * Validates a full phone number (including dial code) against a country's rules.
 * @param {string} fullPhone - Full phone number (e.g. "+56912345678")
 * @param {string} countryCode - ISO country code (e.g. "CL", "AR")
 * @returns {string|null} Error message or null if valid.
 */
export function validatePhoneByCountry(fullPhone, countryCode) {
  if (!fullPhone) return 'Teléfono es requerido';

  const config = getPhoneConfig(countryCode);
  const digits = fullPhone.replace(/\D/g, '');
  const dialDigits = config.dial.replace(/\D/g, '');
  const numberDigits = digits.replace(new RegExp(`^${dialDigits}`), '');

  if (numberDigits.length < config.minDigits) {
    return `Debe tener al menos ${config.minDigits} dígitos después del código`;
  }

  if (numberDigits.length > config.maxDigits) {
    return `Debe tener máximo ${config.maxDigits} dígitos después del código`;
  }

  return null;
}

/**
 * Formats a phone number for display with proper spacing (Chile: +56 9 XXXX XXXX)
 * @param {string} fullPhone - Full phone number
 * @param {string} countryCode - ISO country code
 * @returns {string} Formatted phone
 */
export function formatPhone(fullPhone, countryCode) {
  if (!fullPhone) return '';
  const config = getPhoneConfig(countryCode);
  const digits = fullPhone.replace(/\D/g, '');
  const dialDigits = config.dial.replace(/\D/g, '');
  const number = digits.replace(new RegExp(`^${dialDigits}`), '');

  if (countryCode === 'CL' && number.length === 9) {
    return `${config.dial} ${number[0]} ${number.slice(1, 5)} ${number.slice(5)}`;
  }

  return `${config.dial} ${number}`;
}

/**
 * Strips dial code from a full phone to get just the local number.
 */
export function stripDialCode(fullPhone, countryCode) {
  if (!fullPhone) return '';
  const config = getPhoneConfig(countryCode);
  const digits = fullPhone.replace(/\D/g, '');
  const dialDigits = config.dial.replace(/\D/g, '');
  return digits.replace(new RegExp(`^${dialDigits}`), '');
}

/**
 * Combines dial code + local number into a full phone string.
 */
export function combinePhone(dialCode, localNumber) {
  const digits = localNumber.replace(/\D/g, '');
  if (!digits) return '';
  return `${dialCode}${digits}`;
}
