import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { getCachedAddress, setCachedAddress } from './cacheService';

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

export async function getAddressSuggestions(address, country = 'cl') {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  if (!address.trim()) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}&limit=5`;

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

export function getStaticMapUrl(origin, destination, width = 600, height = 400) {
  if (!MAPBOX_ACCESS_TOKEN) return null;

  const markers = `pin-s+3b82f6(${origin.lng},${origin.lat}),pin-s+f97316(${destination.lng},${destination.lat})`;
  const path = `path-4+f97316(f${origin.lng},${origin.lat},${destination.lng},${destination.lat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/${path}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
}
