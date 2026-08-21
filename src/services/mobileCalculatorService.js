const FIELD_NAMES = {
  distance: 'distance',
  kmPerLiter: 'kmPerLiter',
  pricePerLiter: 'pricePerLiter',
  wearCostPerKm: 'wearCostPerKm',
};

function isValidPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validatePositiveNumber(value, fieldName) {
  if (!isValidPositiveNumber(value)) {
    throw new Error(`Invalid input: ${fieldName} must be a positive number`);
  }
}

/**
 * Calculates the cost breakdown for a mobile delivery trip.
 *
 * @param {Object} inputs
 * @param {number} inputs.distance - Distance in kilometers.
 * @param {number} inputs.kmPerLiter - Vehicle fuel consumption in km/L.
 * @param {number} inputs.pricePerLiter - Fuel price per liter.
 * @param {number} inputs.wearCostPerKm - Wear/maintenance cost per km.
 * @returns {{ fuelCost: number, wearCost: number, total: number }}
 */
export function calculateMobileCost({ distance, kmPerLiter, pricePerLiter, wearCostPerKm }) {
  validatePositiveNumber(distance, FIELD_NAMES.distance);
  validatePositiveNumber(kmPerLiter, FIELD_NAMES.kmPerLiter);
  validatePositiveNumber(pricePerLiter, FIELD_NAMES.pricePerLiter);
  validatePositiveNumber(wearCostPerKm, FIELD_NAMES.wearCostPerKm);

  const fuelCost = (distance / kmPerLiter) * pricePerLiter;
  const wearCost = distance * wearCostPerKm;
  const total = fuelCost + wearCost;

  return { fuelCost, wearCost, total };
}

function formatCurrency(value) {
  return Number(value).toLocaleString('es-AR');
}

/**
 * Formats the WhatsApp share message for a mobile cost estimate.
 *
 * @param {Object} params
 * @param {number} params.fuelCost
 * @param {number} params.wearCost
 * @param {number} params.total
 * @returns {string}
 */
export function prepareMobileCostMessage({ fuelCost, wearCost, total }) {
  if (!isValidPositiveNumber(fuelCost) || !isValidPositiveNumber(wearCost) || !isValidPositiveNumber(total)) {
    return '';
  }

  return `Costo estimado del envío: $${formatCurrency(total)} (combustible $${formatCurrency(fuelCost)} + desgaste $${formatCurrency(wearCost)}). Calculado en caldero-envio.com`;
}

/**
 * Opens WhatsApp with a pre-filled message in a new tab.
 *
 * @param {string} message
 */
export function openWhatsAppShare(message) {
  if (typeof window === 'undefined' || !message) {
    return;
  }

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  // eslint-disable-next-line no-undef
  window.open(url, '_blank', 'noopener,noreferrer');
}
