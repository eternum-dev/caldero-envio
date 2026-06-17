const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');

const MAPBOX_TOKEN = defineSecret('MAPBOX_TOKEN');

// ──────────────────────────────────────────────
// mapboxGeocode — forward geocoding
// Serves: geocodeAddress(), getCitiesByCountry(), getCityDetails()
// ──────────────────────────────────────────────
exports.mapboxGeocode = onCall(
  { secrets: [MAPBOX_TOKEN], region: 'us-central1' },
  async (request) => {
    const { query, country, types, limit } = request.data || {};

    if (query === undefined || query === null) {
      throw new HttpsError('invalid-argument', 'Missing required field: query');
    }

    const token = MAPBOX_TOKEN.value();
    const encodedQuery = encodeURIComponent(query);
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}`;

    if (country) url += `&country=${country}`;
    if (types) url += `&types=${types}`;
    if (limit) url += `&limit=${limit}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      logger.warn('Mapbox geocode failed', { status: response.status, message: data.message });
      throw new HttpsError('external', data.message || 'Mapbox geocoding error', {
        status: response.status,
      });
    }

    return { features: data.features || [] };
  }
);

// ──────────────────────────────────────────────
// mapboxReverseGeocode — reverse geocoding
// Serves: reverseGeocode()
// ──────────────────────────────────────────────
exports.mapboxReverseGeocode = onCall(
  { secrets: [MAPBOX_TOKEN], region: 'us-central1' },
  async (request) => {
    const { lat, lng } = request.data || {};

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new HttpsError('invalid-argument', 'lat and lng must be numbers');
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new HttpsError('invalid-argument', 'Coordinates out of range');
    }

    const token = MAPBOX_TOKEN.value();
    // Note: Mapbox uses lng,lat order
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      logger.warn('Mapbox reverse geocode failed', { status: response.status });
      throw new HttpsError('external', data.message || 'Mapbox reverse geocoding error', {
        status: response.status,
      });
    }

    return { features: data.features || [] };
  }
);

// ──────────────────────────────────────────────
// mapboxDirections — directions / routing
// Serves: getDistance()
// ──────────────────────────────────────────────
exports.mapboxDirections = onCall(
  { secrets: [MAPBOX_TOKEN], region: 'us-central1' },
  async (request) => {
    const { origin, destination } = request.data || {};

    if (!origin || !destination) {
      throw new HttpsError('invalid-argument', 'origin and destination are required');
    }
    if (typeof origin.lat !== 'number' || typeof origin.lng !== 'number' ||
        typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      throw new HttpsError('invalid-argument', 'origin and destination must have numeric lat/lng');
    }

    const token = MAPBOX_TOKEN.value();
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      logger.warn('Mapbox directions failed', { status: response.status });
      throw new HttpsError('external', data.message || 'Mapbox directions error', {
        status: response.status,
      });
    }

    if (!data.routes || data.routes.length === 0) {
      throw new HttpsError('not-found', 'No route found');
    }

    const route = data.routes[0];
    return {
      distance: route.distance,   // meters (client divides by 1000)
      duration: route.duration,   // seconds (client divides by 60)
      geometry: route.geometry,   // polyline string
    };
  }
);

// ──────────────────────────────────────────────
// mapboxSuggestions — address autocomplete
// Serves: getAddressSuggestions()
// ──────────────────────────────────────────────
exports.mapboxSuggestions = onCall(
  { secrets: [MAPBOX_TOKEN], region: 'us-central1' },
  async (request) => {
    const { query, country, limit, bbox } = request.data || {};

    if (!query || !query.trim()) {
      return { features: [] };
    }

    const token = MAPBOX_TOKEN.value();
    const encodedQuery = encodeURIComponent(query);
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=${limit || 5}`;

    if (country) url += `&country=${country}`;
    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      url += `&bbox=${bbox.join(',')}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      logger.warn('Mapbox suggestions failed', { status: response.status });
      // Suggestions are non-critical — return empty instead of throwing
      return { features: [] };
    }

    return { features: data.features || [] };
  }
);