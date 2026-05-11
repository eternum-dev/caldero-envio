/**
 * Shared validation utilities for courier and store data.
 */

/**
 * Validates a courier name.
 * @param {string} name - The courier name to validate.
 * @returns {string|null} Error message if invalid, null if valid.
 */
export function validateCourierName(name) {
  if (!name || name.trim().length < 2) {
    return 'Nombre debe tener al menos 2 caracteres';
  }
  if (/^\d+$/.test(name.trim())) {
    return 'Nombre no puede ser solo números';
  }
  return null;
}

/**
 * Validates a phone number.
 * @param {string} phone - The phone number to validate.
 * @returns {string|null} Error message if invalid, null if valid.
 */
export function validatePhone(phone) {
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    return 'Teléfono debe tener al menos 8 dígitos';
  }
  if (!/^\+?[\d\s]+$/.test(phone)) {
    return 'Teléfono solo puede tener números y +';
  }
  return null;
}