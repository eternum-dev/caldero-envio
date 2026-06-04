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

/**
 * Validates an array of pricing rules for continuity and valid values.
 * Checks that the first rule has a positive price, that prices are ascending,
 * and that distance ranges are continuous (each rule's minKm matches the
 * previous rule's maxKm).
 * @param {Array<{minKm: number, maxKm: number|null, price: number}>} rules
 * @returns {Array<string|null>} Error per rule (null = valid).
 */
export function validatePricingRules(rules) {
  const errors = rules.map(() => null);

  for (let i = 0; i < rules.length; i++) {
    if (i === 0) {
      if (!rules[i].price || rules[i].price <= 0) {
        errors[i] = 'El precio debe ser mayor a 0';
      }
      continue;
    }

    if (rules[i].price < rules[i - 1].price) {
      errors[i] = 'El precio no puede ser menor al de la regla anterior';
    }

    if (rules[i].minKm !== rules[i - 1].maxKm) {
      errors[i] = errors[i] || 'La distancia inicial debe ser igual a la distancia final de la regla anterior';
    }
  }

  return errors;
}