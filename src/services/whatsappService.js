export async function sendWhatsAppMessage(phoneNumber, message) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

export function generateWhatsAppLink(phoneNumber, message) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function prepareRouteMessage({
  storeName,
  address,
  price,
  distance,
  time,
  courierName,
  mapUrl,
}) {
  const lines = [
    `🏪 *${storeName}*`,
    `📍 *Dirección:* ${address}`,
    `📦 *Distancia:* ${distance.toFixed(1)} km`,
    `⏱️ *Tiempo:* ${Math.round(time)} min`,
    `👤 *Repartidor:* ${courierName || 'Por asignar'}`,
    '',
    `💰 *Precio del envío:* $${price}`,
    '',
  ];

  if (mapUrl) {
    lines.push(`🗺️ *Mapa:* ${mapUrl}`);
    lines.push('');
  }

  lines.push('¡Gracias por confiar en nosotros!');

  return lines.join('\n');
}
