const FIELD_NAMES = {
  distance: 'distance',
  kmPerLiter: 'kmPerLiter',
  pricePerLiter: 'pricePerLiter',
  wearCostPerKm: 'wearCostPerKm',
  marginPercent: 'marginPercent',
};

function isValidPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validatePositiveNumber(value, fieldName) {
  if (!isValidPositiveNumber(value)) {
    throw new Error(`Invalid input: ${fieldName} must be a positive number`);
  }
}

function validateFiniteNumber(value, fieldName) {
  if (!isValidFiniteNumber(value)) {
    throw new Error(`Invalid input: ${fieldName} must be a finite number`);
  }
}

/**
 * Calculates the cost breakdown and suggested price for a mobile delivery trip.
 *
 * Cost = combustible + desgaste.
 * Suggested price = cost + margin.
 *
 * @param {Object} inputs
 * @param {number} inputs.distance - Distance in kilometers (one-way).
 * @param {number} inputs.kmPerLiter - Vehicle fuel consumption in km/L.
 * @param {number} inputs.pricePerLiter - Fuel price per liter.
 * @param {number} inputs.wearCostPerKm - Wear/maintenance cost per km.
 * @param {number} inputs.marginPercent - Profit margin as a percentage
 *   (e.g. 25 for 25%). Can be 0 for breakeven. Negative values are allowed
 *   (e.g. -10 for a discount below cost) but not recommended.
 * @returns {{
 *   fuelCost: number,
 *   wearCost: number,
 *   costSubtotal: number,
 *   marginAmount: number,
 *   price: number,
 *   marginPercent: number,
 * }}
 */
export function calculateMobileCost({
  distance,
  kmPerLiter,
  pricePerLiter,
  wearCostPerKm,
  marginPercent,
}) {
  validatePositiveNumber(distance, FIELD_NAMES.distance);
  validatePositiveNumber(kmPerLiter, FIELD_NAMES.kmPerLiter);
  validatePositiveNumber(pricePerLiter, FIELD_NAMES.pricePerLiter);
  validatePositiveNumber(wearCostPerKm, FIELD_NAMES.wearCostPerKm);
  validateFiniteNumber(marginPercent, FIELD_NAMES.marginPercent);

  const fuelCost = (distance / kmPerLiter) * pricePerLiter;
  const wearCost = distance * wearCostPerKm;
  const costSubtotal = fuelCost + wearCost;
  const marginAmount = costSubtotal * (marginPercent / 100);
  const price = costSubtotal + marginAmount;

  return { fuelCost, wearCost, costSubtotal, marginAmount, price, marginPercent };
}

function formatCurrency(value) {
  return Number(value).toLocaleString('es-AR');
}

/**
 * Formats the WhatsApp share message for a mobile cost estimate.
 *
 * @param {Object} params
 * @param {number} params.costSubtotal - Cost of the trip (fuel + wear).
 * @param {number} params.marginAmount - Profit margin amount.
 * @param {number} params.price - Total suggested price (cost + margin).
 * @param {number} params.marginPercent - Margin percentage used.
 * @returns {string}
 */
export function prepareMobileCostMessage({ costSubtotal, marginAmount, price, marginPercent }) {
  if (
    !isValidPositiveNumber(costSubtotal) ||
    !isValidFiniteNumber(marginAmount) ||
    !isValidPositiveNumber(price) ||
    !isValidFiniteNumber(marginPercent)
  ) {
    return '';
  }

  return `Precio sugerido del envío: $${formatCurrency(price)} (costo $${formatCurrency(costSubtotal)} + margen ${marginPercent}%). Calculado en caldero-envio.com`;
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
