import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { MAPBOX_GL_TOKEN } from '../config/mapbox';
import { getCachedAddress, setCachedAddress, getCachedCoordinate, setCachedCoordinate } from './cacheService';
import { getCitiesByCountry as fetchCitiesFromGeoNames } from './geoNamesService';

// Module-level callable references (created once)
const geocodeFn = httpsCallable(functions, 'mapboxGeocode');
const reverseGeocodeFn = httpsCallable(functions, 'mapboxReverseGeocode');
const directionsFn = httpsCallable(functions, 'mapboxDirections');
const suggestionsFn = httpsCallable(functions, 'mapboxSuggestions');

/**
 * Helper to wrap httpsCallable calls and re-throw HttpsError as plain Error.
 */
async function callMapbox(fn, params) {
  try {
    return await fn(params);
  } catch (err) {
    throw new Error(err.message || 'Error de conexión con Mapbox');
  }
}

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
 * Uses Cloud Function proxy to Mapbox Geocoding API.
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

  // 2. Call Cloud Function
  const { data } = await callMapbox(reverseGeocodeFn, { lat, lng });

  // 3. No features found → return null
  if (!data.features || data.features.length === 0) {
    return null;
  }

  // 4. Parse response
  const feature = data.features[0];
  const [centerLng, centerLat] = feature.center;
  const result = {
    placeName: feature.place_name,
    coordinates: { lat: centerLat, lng: centerLng },
  };

  // 5. Cache result
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

  const { data } = await callMapbox(geocodeFn, { query: address, country });

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
 * Fallback: Mapbox geocoding via Cloud Function.
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

  // Fallback: Mapbox geocoding via Cloud Function
  const { data } = await callMapbox(geocodeFn, {
    query: '',
    country: country.toLowerCase(),
    types: 'place,locality',
    limit: 100,
  });

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
  const { data } = await callMapbox(geocodeFn, {
    query: cityName,
    country,
    types: 'place,locality',
    limit: 1,
  });

  if (!data.features || data.features.length === 0) {
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
  if (!address.trim()) return [];

  const { data } = await callMapbox(suggestionsFn, {
    query: address,
    country,
    limit: 5,
    bbox,
  });

  if (!data.features || data.features.length === 0) {
    return [];
  }

  return data.features.map(feature => ({
    placeName: feature.place_name,
    coordinates: { lat: feature.center[1], lng: feature.center[0] },
  }));
}

export async function getDistance(origin, destination) {
  const { data } = await callMapbox(directionsFn, { origin, destination });

  return {
    distance: data.distance / 1000,
    time: data.duration / 60,
    geometry: data.geometry,
  };
}

export function generateGoogleMapsLink(origin, destination) {
  if (!origin || !destination) return null;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  return url;
}

export function getStaticMapUrl(origin, destination, width = 600, height = 400) {
  if (!MAPBOX_GL_TOKEN) return null;

  const markers = `pin-s+3b82f6(${origin.lng},${origin.lat}),pin-s+f97316(${destination.lng},${destination.lat})`;
  const path = `path-4+f97316(f${origin.lng},${origin.lat},${destination.lng},${destination.lat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/${path}/${width}x${height}?access_token=${MAPBOX_GL_TOKEN}`;
}