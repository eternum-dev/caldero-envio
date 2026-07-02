const functions = require('firebase-functions');

// ── Calderos (monetization) ──────────────────

exports.createAccountWithFreeTier = require('./calderos/createAccountWithFreeTier');

/**
 * Helper: calls Mapbox API with native fetch (Node 18).
 */
async function mapboxFetch(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new functions.https.HttpsError('external', data.message || 'Mapbox API error');
  }
  return data;
}

// ──────────────────────────────────────────────
// mapboxGeocode — forward geocoding
// ──────────────────────────────────────────────
exports.mapboxGeocode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { query, country, types, limit } = data;
  if (query === undefined || query === null) {
    throw new functions.https.HttpsError('invalid-argument', 'query es requerido');
  }

  const token = functions.config().mapbox.token;
  const encodedQuery = encodeURIComponent(query);
  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}`;

  if (country) url += `&country=${country}`;
  if (types) url += `&types=${types}`;
  if (limit) url += `&limit=${limit}`;

  const result = await mapboxFetch(url);
  return { features: result.features || [] };
});

// ──────────────────────────────────────────────
// mapboxReverseGeocode — reverse geocoding
// ──────────────────────────────────────────────
exports.mapboxReverseGeocode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { lat, lng } = data;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new functions.https.HttpsError('invalid-argument', 'lat y lng deben ser números');
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new functions.https.HttpsError('invalid-argument', 'Coordenadas fuera de rango');
  }

  const token = functions.config().mapbox.token;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;
  const result = await mapboxFetch(url);

  return { features: result.features || [] };
});

// ──────────────────────────────────────────────
// mapboxDirections — directions / routing
// ──────────────────────────────────────────────
exports.mapboxDirections = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { origin, destination } = data;
  if (!origin || !destination) {
    throw new functions.https.HttpsError('invalid-argument', 'origin y destination son requeridos');
  }

  const token = functions.config().mapbox.token;
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${token}`;
  const result = await mapboxFetch(url);

  if (!result.routes || result.routes.length === 0) {
    throw new functions.https.HttpsError('not-found', 'No se encontró una ruta');
  }

  const route = result.routes[0];
  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
  };
});

// ──────────────────────────────────────────────
// mapboxSuggestions — address autocomplete
// ──────────────────────────────────────────────
exports.mapboxSuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { query, country, limit, bbox } = data;
  if (!query || !query.trim()) {
    return { features: [] };
  }

  const token = functions.config().mapbox.token;
  const encodedQuery = encodeURIComponent(query);
  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=${limit || 5}`;

  if (country) url += `&country=${country}`;
  if (bbox && Array.isArray(bbox) && bbox.length === 4) {
    url += `&bbox=${bbox.join(',')}`;
  }

  try {
    const result = await mapboxFetch(url);
    return { features: result.features || [] };
  } catch (e) {
    return { features: [], _error: e.message };
  }
});
