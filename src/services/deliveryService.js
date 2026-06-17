export function calculatePrice(distance, pricingRules) {
  if (!pricingRules || pricingRules.length === 0) {
    return 0;
  }

  const sortedRules = [...pricingRules].sort((a, b) => a.minKm - b.minKm);

  for (const rule of sortedRules) {
    const maxKm = rule.maxKm ?? Infinity;
    if (distance >= rule.minKm && distance <= maxKm) {
      return rule.price;
    }
  }

  const lastRule = sortedRules[sortedRules.length - 1];
  if (distance > lastRule.minKm) {
    const extraKm = distance - lastRule.minKm;
    const extraPrice = extraKm * (lastRule.pricePerKm || 0);
    return lastRule.price + extraPrice;
  }

  return sortedRules[0].price;
}

export function formatDeliveryMessage({ storeName, address, price, distance, courierName }) {
  const message = `¡Hola! Te paso los datos del envío:

🏪 Local: ${storeName}
📍 Dirección: ${address}
📦 Distancia: ${distance.toFixed(1)} km
💰 Precio: $${price}

¡Gracias!`;
  return message;
}

/**
 * Escapes HTML entities to prevent XSS in document.write.
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function getPrintContent({ storeName, address, price, distance, time, courierName }) {
  return `
    <div style="font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; background: #121110; color: #e6e1df;">
      <h2 style="text-align: center; color: #FFBF00;">${escapeHtml(storeName)}</h2>
      <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
      <p><strong>Dirección:</strong> ${escapeHtml(address)}</p>
      <p><strong>Distancia:</strong> ${distance.toFixed(1)} km</p>
      <p><strong>Tiempo:</strong> ${Math.round(time)} min</p>
      <p><strong>Repartidor:</strong> ${escapeHtml(courierName) || 'No asignado'}</p>
      <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
      <h1 style="text-align: center; font-size: 24px; color: #FFBF00;">$${price}</h1>
      <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
      <p style="text-align: center; font-size: 12px; color: #d4c3ba;">Caldero Envío</p>
    </div>
  `;
}

/**
 * @deprecated Use `generateWhatsAppLink` from whatsappService instead.
 * Kept temporarily to avoid breaking existing imports.
 */
export { generateWhatsAppLink } from './whatsappService';
