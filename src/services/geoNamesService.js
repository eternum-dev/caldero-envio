/**
 * GeoNames API service for city lookup by country.
 * Uses the free GeoNames API (requires username).
 */
const GEONAMES_USERNAME = import.meta.env.VITE_GEONAMES_USERNAME || '';
const BASE_URL = 'https://secure.geonames.org';

/**
 * Fetch cities / populated places for a given country code.
 *
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code, e.g. 'CL', 'AR'
 * @returns {Promise<{ name: string, center: { lng: number, lat: number }, population: number }[]>}
 */
export async function getCitiesByCountry(countryCode) {
  if (!GEONAMES_USERNAME) {
    throw new Error('GeoNames username no configurado (VITE_GEONAMES_USERNAME)');
  }

  const params = new URLSearchParams({
    country: countryCode.toUpperCase(),
    featureClass: 'P',
    featureCode: 'PPLA',   // seat of administrative division (major cities)
    maxRows: '200',
    orderBy: 'population',
    username: GEONAMES_USERNAME,
  });

  // Fallback: if PPLA returns too few results, add PPL (populated places)
  const url = `${BASE_URL}/searchJSON?${params}`;

  const response = await fetch(url, { mode: 'cors' });

  if (!response.ok) {
    // Try HTTP fallback for free-tier users (secure.geonames.org may need paid plan)
    const httpUrl = `http://api.geonames.org/searchJSON?${params}`;
    const fallbackResponse = await fetch(httpUrl, { mode: 'cors' });
    if (!fallbackResponse.ok) {
      throw new Error('Error al obtener ciudades desde GeoNames');
    }
    const fallbackData = await fallbackResponse.json();
    return parseCities(fallbackData);
  }

  const data = await response.json();
  const cities = parseCities(data);

  // If PPLA returned too few results, re-fetch with broader featureClass
  if (cities.length < 10) {
    const broadParams = new URLSearchParams({
      country: countryCode.toUpperCase(),
      featureClass: 'P',
      maxRows: '200',
      orderBy: 'population',
      username: GEONAMES_USERNAME,
    });
    const broadUrl = `http://api.geonames.org/searchJSON?${broadParams}`;
    try {
      const broadResponse = await fetch(broadUrl, { mode: 'cors' });
      if (broadResponse.ok) {
        const broadData = await broadResponse.json();
        return parseCities(broadData);
      }
    } catch {
      // Ignore broad fetch error, return PPLA results
    }
  }

  return cities;
}

function parseCities(data) {
  if (!data.geonames || !Array.isArray(data.geonames)) {
    return [];
  }

  return data.geonames
    .filter(geo => geo.name && geo.lat && geo.lng)
    .map(geo => ({
      name: geo.name,
      fullName: geo.toponymName || geo.name,
      center: { lng: parseFloat(geo.lng), lat: parseFloat(geo.lat) },
      population: geo.population ?? 0,
      countryCode: geo.countryCode,
    }));
}
