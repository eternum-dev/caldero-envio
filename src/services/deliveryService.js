export function calculatePrice(distance, pricingRules) {
  if (!pricingRules || pricingRules.length === 0) {
    return 0
  }

  const sortedRules = [...pricingRules].sort((a, b) => a.minKm - b.minKm)

  for (const rule of sortedRules) {
    const maxKm = rule.maxKm ?? Infinity
    if (distance >= rule.minKm && distance <= maxKm) {
      return rule.price
    }
  }

  const lastRule = sortedRules[sortedRules.length - 1]
  if (distance > lastRule.minKm) {
    const extraKm = distance - lastRule.minKm
    const extraPrice = extraKm * (lastRule.pricePerKm || 0)
    return lastRule.price + extraPrice
  }

  return sortedRules[0].price
}

export function formatDeliveryMessage({ storeName, address, price, distance, courierName }) {
  const message = `¡Hola! Te paso los datos del envío:

🏪 Local: ${storeName}
📍 Dirección: ${address}
📦 Distancia: ${distance.toFixed(1)} km
💰 Precio: $${price}

¡Gracias!`
  return message
}

export function generateWhatsAppLink(phoneNumber, message) {
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function getPrintContent({ storeName, address, price, distance, time, courierName }) {
  return `
    <div style="font-family: monospace; padding: 20px; max-width: 300px;">
      <h2 style="text-align: center;">${storeName}</h2>
      <hr style="border: 1px solid #ccc;">
      <p><strong>Dirección:</strong> ${address}</p>
      <p><strong>Distancia:</strong> ${distance.toFixed(1)} km</p>
      <p><strong>Tiempo estimado:</strong> ${Math.round(time)} min</p>
      <p><strong>Repartidor:</strong> ${courierName || 'No asignado'}</p>
      <hr style="border: 1px solid #ccc;">
      <h1 style="text-align: center; font-size: 24px;">$${price}</h1>
      <hr style="border: 1px solid #ccc;">
      <p style="text-align: center; font-size: 12px;">Generado por Caldero Envío</p>
    </div>
  `
}