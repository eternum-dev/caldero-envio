import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { getCachedAddress, setCachedAddress } from './cacheService';

// City centers for proximity-biased geocoding (lng, lat)
const COUNTRY_CITY_CENTERS = {
  AR: {
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    'Córdoba': { lat: -31.4201, lng: -64.1888 },
    'Rosario': { lat: -32.9442, lng: -60.6505 },
    'Mendoza': { lat: -32.8895, lng: -68.8453 },
    'La Plata': { lat: -34.9214, lng: -57.9545 },
    'Tucumán': { lat: -26.8083, lng: -65.2176 },
    'Salta': { lat: -24.7859, lng: -65.4117 },
    'Santa Fe': { lat: -31.6467, lng: -60.7089 },
    'Mar del Plata': { lat: -38.0055, lng: -57.5426 },
  },
  CL: {
    'Santiago': { lat: -33.4489, lng: -70.6693 },
    'Puente Alto': { lat: -33.6076, lng: -70.5765 },
    'Antofagasta': { lat: -23.6509, lng: -70.3975 },
    'Viña del Mar': { lat: -33.0078, lng: -71.5511 },
    'Valparaíso': { lat: -33.0472, lng: -71.6127 },
    'Concepción': { lat: -36.8201, lng: -73.0443 },
    'Temuco': { lat: -38.7365, lng: -72.5986 },
    'Puerto Montt': { lat: -41.4689, lng: -72.9424 },
  },
  CO: {
    'Bogotá': { lat: 4.7110, lng: -74.0721 },
    'Medellín': { lat: 6.2442, lng: -75.5812 },
    'Cali': { lat: 3.4516, lng: -76.5320 },
    'Barranquilla': { lat: 10.9685, lng: -74.8013 },
    'Cartagena': { lat: 10.3910, lng: -75.4794 },
  },
  MX: {
    'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
    'Guadalajara': { lat: 20.6597, lng: -103.3496 },
    'Monterrey': { lat: 25.6670, lng: -100.3095 },
    'Puebla': { lat: 19.0413, lng: -98.2063 },
    'Tijuana': { lat: 32.5149, lng: -117.0382 },
  },
  PE: {
    'Lima': { lat: -12.0464, lng: -77.0428 },
    'Arequipa': { lat: -16.4090, lng: -71.5375 },
    'Trujillo': { lat: -8.1116, lng: -79.0288 },
  },
  UY: {
    'Montevideo': { lat: -34.9011, lng: -56.1645 },
    'Salto': { lat: -31.3889, lng: -57.0854 },
    'Paysandú': { lat: -32.3194, lng: -58.0817 },
  },
  PY: {
    'Asunción': { lat: -25.2637, lng: -57.5759 },
    'Ciudad del Este': { lat: -25.5085, lng: -54.6122 },
  },
  BO: {
    'La Paz': { lat: -16.5000, lng: -68.1500 },
    'Santa Cruz de la Sierra': { lat: -17.8146, lng: -63.1561 },
    'Cochabamba': { lat: -17.3895, lng: -66.1568 },
  },
  EC: {
    'Quito': { lat: -0.1807, lng: -78.4678 },
    'Guayaquil': { lat: -2.1894, lng: -79.8890 },
    'Cuenca': { lat: -2.9005, lng: -79.0059 },
  },
  BR: {
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Brasília': { lat: -15.7975, lng: -47.8919 },
    'Salvador': { lat: -12.9714, lng: -38.5014 },
    'Fortaleza': { lat: -3.7172, lng: -38.5433 },
  },
};

/**
 * Decodes a polyline encoded string to an array of [lng, lat] coordinates.
 * Used to decode route.geometry from Mapbox Directions API.
 */
export function decodePolyline(encoded) {
  if (!encoded) return [];

  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

export async function geocodeAddress(address, country = 'cl') {
  const cached = getCachedAddress(address);
  if (cached?.coordinates) {
    return {
      coordinates: cached.coordinates,
      fromCache: true,
    };
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log('Mapbox geocoding response:', data);

  if (!response.ok) {
    throw new Error(data.message || 'Error al buscar dirección');
  }

  if (!data.features || data.features.length === 0) {
    throw new Error('Dirección no encontrada');
  }

  const [lng, lat] = data.features[0].center;
  const coordinates = { lat, lng };

  setCachedAddress(address, { coordinates });

  return {
    coordinates,
    placeName: data.features[0].place_name,
    fromCache: false,
  };
}

export async function getAddressSuggestions(address, country = 'cl', city = null) {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  if (!address.trim()) return [];

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}&limit=5`;

  // Add proximity bias if city is provided to filter results to the locality
  if (city) {
    const cityCenter = COUNTRY_CITY_CENTERS[country]?.[city];
    if (cityCenter) {
      url += `&proximity=${cityCenter.lng},${cityCenter.lat}`;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    return [];
  }

  if (!data.features || data.features.length === 0) {
    return [];
  }

  return data.features.map(feature => ({
    placeName: feature.place_name,
    coordinates: { lat: feature.center[1], lng: feature.center[0] },
  }));
}

export async function getDistance(origin, destination) {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_ACCESS_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No se pudo calcular la ruta');
  }

  const route = data.routes[0];
  return {
    distance: route.distance / 1000,
    time: route.duration / 60,
    geometry: route.geometry,
  };
}

export function generateGoogleMapsLink(origin, destination) {
  if (!origin || !destination) return null;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  return url;
}

export function getStaticMapUrl(origin, destination, width = 600, height = 400) {
  if (!MAPBOX_ACCESS_TOKEN) return null;

  const markers = `pin-s+3b82f6(${origin.lng},${origin.lat}),pin-s+f97316(${destination.lng},${destination.lat})`;
  const path = `path-4+f97316(f${origin.lng},${origin.lat},${destination.lng},${destination.lat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/${path}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
}
