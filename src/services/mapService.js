import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { getCachedAddress, setCachedAddress, getCachedCoordinate, setCachedCoordinate } from './cacheService';
import { getCitiesByCountry as fetchCitiesFromGeoNames } from './geoNamesService';

/**
 * Get offset based on city population for bbox calculation.
 */
export function getOffsetByPopulation(population) {
  if (population > 5000000) return 0.5;
  if (population > 1000000) return 0.3;
  if (population > 100000) return 0.2;
  return 0.1;
}

/**
 * Create bbox from center point and offset.
 * Returns [west, south, east, north]
 */
export function createBBox(lng, lat, offset) {
  return [
    lng - offset,  // west
    lat - offset,  // south
    lng + offset,  // east
    lat + offset   // north
  ];
}

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

/**
 * Reverse geocode coordinates to a human-readable place name.
 * Uses Mapbox Geocoding API v5 reverse endpoint.
 * Results are cached via cacheService.
 *
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lng - Longitude (-180 to 180)
 * @returns {Promise<{ placeName: string, coordinates: { lat: number, lng: number } } | null>}
 */
export async function reverseGeocode(lat, lng) {
  // 1. Check cache first
  const cached = getCachedCoordinate(lat, lng);
  if (cached) {
    return {
      placeName: cached.placeName,
      coordinates: cached.coordinates,
      fromCache: true,
    };
  }

  // 2. Validate token
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  // 3. Build URL — Mapbox reverse geocoding uses lng,lat order
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

  // 4. Fetch
  const response = await fetch(url);
  const data = await response.json();

  // 5. Handle HTTP errors
  if (!response.ok) {
    throw new Error(data.message || 'Error en reverse geocoding');
  }

  // 6. No features found → return null
  if (!data.features || data.features.length === 0) {
    return null;
  }

  // 7. Parse response
  const feature = data.features[0];
  const [centerLng, centerLat] = feature.center;
  const result = {
    placeName: feature.place_name,
    coordinates: { lat: centerLat, lng: centerLng },
  };

  // 8. Cache result
  setCachedCoordinate(lat, lng, result);

  return result;
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

/**
 * Get cities for a given country to populate the CitySelect dropdown.
 * Primary source: GeoNames API (reliable city listing).
 * Fallback: Mapbox geocoding with a broad query.
 */
export async function getCitiesByCountry(country = 'cl') {
  // Try GeoNames first (designed for listing populated places)
  if (import.meta.env.VITE_GEONAMES_USERNAME) {
    try {
      const cities = await fetchCitiesFromGeoNames(country);
      if (cities.length > 0) return cities;
    } catch {
      // GeoNames failed, fall through to Mapbox
    }
  }

  // Fallback: Mapbox geocoding
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  const countryCode = country.toLowerCase();
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${countryCode}&types=place,locality&limit=100`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al buscar ciudades');
  }

  if (!data.features || data.features.length === 0) {
    return [];
  }

  return data.features.map(feature => ({
    name: feature.text,
    fullName: feature.place_name,
    center: { lng: feature.center[0], lat: feature.center[1] },
    bbox: feature.bbox || null,
  }));
}

/**
 * Get city details including bbox for a specific city.
 * Called when user selects a city to get the bbox for address filtering.
 */
export async function getCityDetails(cityName, country = 'cl') {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}&types=place,locality&limit=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.features || data.features.length === 0) {
    return null;
  }

  const feature = data.features[0];
  return {
    name: feature.text,
    fullName: feature.place_name,
    center: { lng: feature.center[0], lat: feature.center[1] },
    bbox: feature.bbox || null,
  };
}

export async function getAddressSuggestions(address, country = 'cl', bbox = null) {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token no configurado');
  }

  if (!address.trim()) return [];

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}&limit=5`;

  // Add bbox to restrict results to a specific area (e.g., city bounds)
  if (bbox) {
    url += `&bbox=${bbox.join(',')}`;
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