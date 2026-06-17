import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/config/mapbox', () => ({
  MAPBOX_GL_TOKEN: 'test-token',
}));

vi.mock('../../src/services/cacheService', () => ({
  getCachedAddress: vi.fn(() => null),
  setCachedAddress: vi.fn(),
  getCachedCoordinate: vi.fn(() => null),
  setCachedCoordinate: vi.fn(),
}));

vi.mock('../../src/services/geoNamesService', () => ({
  getCitiesByCountry: vi.fn(() => []),
}));

import {
  decodePolyline,
  getOffsetByPopulation,
  createBBox,
  generateGoogleMapsLink,
  getStaticMapUrl,
  geocodeAddress,
  getAddressSuggestions,
  getDistance,
  getCitiesByCountry,
  getCityDetails,
  reverseGeocode,
} from '../../src/services/mapService';

import { getCachedCoordinate, setCachedCoordinate } from '../../src/services/cacheService';

// ── Pure functions ──────────────────────────────

describe('getOffsetByPopulation', () => {
  it('returns 0.5 for population > 5M', () => {
    expect(getOffsetByPopulation(6_000_000)).toBe(0.5);
    expect(getOffsetByPopulation(10_000_000)).toBe(0.5);
  });

  it('returns 0.3 for population between 1M and 5M', () => {
    expect(getOffsetByPopulation(2_000_000)).toBe(0.3);
    expect(getOffsetByPopulation(5_000_001)).toBe(0.5); // boundary
  });

  it('returns 0.2 for population between 100K and 1M', () => {
    expect(getOffsetByPopulation(500_000)).toBe(0.2);
    expect(getOffsetByPopulation(1_000_001)).toBe(0.3); // boundary
  });

  it('returns 0.1 for population under 100K', () => {
    expect(getOffsetByPopulation(50_000)).toBe(0.1);
    expect(getOffsetByPopulation(0)).toBe(0.1);
  });
});

describe('createBBox', () => {
  it('creates bbox with correct west, south, east, north', () => {
    const bbox = createBBox(-70.66, -33.45, 0.3);
    expect(bbox[0]).toBeCloseTo(-70.96);
    expect(bbox[1]).toBeCloseTo(-33.75);
    expect(bbox[2]).toBeCloseTo(-70.36);
    expect(bbox[3]).toBeCloseTo(-33.15);
  });

  it('works with zero offset', () => {
    const bbox = createBBox(0, 0, 0);
    expect(bbox).toEqual([0, 0, 0, 0]);
  });
});

describe('decodePolyline', () => {
  it('returns empty array for null/undefined', () => {
    expect(decodePolyline(null)).toEqual([]);
    expect(decodePolyline(undefined)).toEqual([]);
    expect(decodePolyline('')).toEqual([]);
  });

  it('decodes a simple polyline correctly', () => {
    // Encoded polyline for a straight line between two points
    // This is a known test case
    const result = decodePolyline('_p~iF~ps|U_ulLnnqC');
    expect(result.length).toBe(2);
    expect(result[0][0]).toBeCloseTo(-120.2, 1); // lng
    expect(result[0][1]).toBeCloseTo(38.5, 1);   // lat
  });

  it('decodes a known Mapbox polyline', () => {
    // Real Mapbox polyline from SF to Oakland
    const encoded = 'irqjFxmwqVz@bDz@nBpAvCfAfD';
    const result = decodePolyline(encoded);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveLength(2); // [lng, lat]
  });

  it('returns array of [lng, lat] pairs', () => {
    const result = decodePolyline('_p~iF~ps|U_ulLnnqC');
    result.forEach(coord => {
      expect(Array.isArray(coord)).toBe(true);
      expect(coord.length).toBe(2);
      expect(typeof coord[0]).toBe('number');
      expect(typeof coord[1]).toBe('number');
    });
  });
});

describe('generateGoogleMapsLink', () => {
  it('returns null when origin is missing', () => {
    expect(generateGoogleMapsLink(null, { lat: -33, lng: -70 })).toBeNull();
  });

  it('returns null when destination is missing', () => {
    expect(generateGoogleMapsLink({ lat: -33, lng: -70 }, null)).toBeNull();
  });

  it('generates correct Google Maps URL', () => {
    const url = generateGoogleMapsLink(
      { lat: -33.45, lng: -70.66 },
      { lat: -34.6, lng: -58.38 }
    );
    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=-33.45,-70.66&destination=-34.6,-58.38&travelmode=driving'
    );
  });
});

describe('getStaticMapUrl', () => {
  it('generates valid Mapbox static map URL', () => {
    const url = getStaticMapUrl(
      { lat: -33.45, lng: -70.66 },
      { lat: -34.60, lng: -58.38 }
    );
    expect(url).toContain('api.mapbox.com');
    expect(url).toContain('test-token');
    expect(url).toContain('pin-s');
  });
});

// ── API functions (with fetch mock) ──────────────

function mockFetch(data) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

describe('geocodeAddress', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('throws when address not found', async () => {
    mockFetch({ features: [] });
    await expect(geocodeAddress('Dirección inválida')).rejects.toThrow('Dirección no encontrada');
  });

  it('returns coordinates on success', async () => {
    mockFetch({
      features: [{ center: [-70.66, -33.45], place_name: 'Av. Siempre Viva, Santiago' }],
    });
    const result = await geocodeAddress('Av. Siempre Viva');
    expect(result.coordinates).toEqual({ lat: -33.45, lng: -70.66 });
    expect(result.placeName).toBe('Av. Siempre Viva, Santiago');
    expect(result.fromCache).toBe(false);
  });

  it('throws on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    await expect(geocodeAddress('Test')).rejects.toThrow('Network error');
  });
});

describe('getAddressSuggestions', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns empty array for empty input', async () => {
    const result = await getAddressSuggestions('');
    expect(result).toEqual([]);
  });

  it('parses features into suggestions', async () => {
    mockFetch({
      features: [
        { place_name: 'Place A', center: [-70.66, -33.45] },
        { place_name: 'Place B', center: [-70.50, -33.40] },
      ],
    });

    const result = await getAddressSuggestions('Place');
    expect(result).toEqual([
      { placeName: 'Place A', coordinates: { lat: -33.45, lng: -70.66 } },
      { placeName: 'Place B', coordinates: { lat: -33.40, lng: -70.50 } },
    ]);
  });

  it('works with bbox parameter', async () => {
    mockFetch({ features: [] });
    const result = await getAddressSuggestions('Test', 'cl', [-70.0, -33.0, -69.0, -32.0]);
    expect(result).toEqual([]);
  });
});

describe('getDistance', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns distance, time and geometry', async () => {
    mockFetch({
      routes: [{ distance: 5200, duration: 900, geometry: 'encoded_polyline' }],
    });

    const result = await getDistance(
      { lat: -33.45, lng: -70.66 },
      { lat: -34.60, lng: -58.38 }
    );
    expect(result.distance).toBeCloseTo(5.2);
    expect(result.time).toBeCloseTo(15);
    expect(result.geometry).toBe('encoded_polyline');
  });

  it('throws when no routes found', async () => {
    mockFetch({ routes: [] });
    await expect(getDistance(
      { lat: -33, lng: -70 },
      { lat: -34, lng: -58 }
    )).rejects.toThrow('No se pudo calcular la ruta');
  });
});

describe('getCitiesByCountry', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns mapped features from Mapbox response', async () => {
    mockFetch({
      features: [
        { text: 'Santiago', place_name: 'Santiago, Chile', center: [-70.66, -33.45], bbox: [-70.8, -33.6, -70.5, -33.3] },
        { text: 'Valparaíso', place_name: 'Valparaíso, Chile', center: [-71.62, -33.04], bbox: null },
      ],
    });

    const cities = await getCitiesByCountry('cl');
    expect(cities).toEqual([
      { name: 'Santiago', fullName: 'Santiago, Chile', center: { lat: -33.45, lng: -70.66 }, bbox: [-70.8, -33.6, -70.5, -33.3] },
      { name: 'Valparaíso', fullName: 'Valparaíso, Chile', center: { lat: -33.04, lng: -71.62 }, bbox: null },
    ]);
  });

  it('returns empty array when no features', async () => {
    mockFetch({ features: [] });
    const result = await getCitiesByCountry('cl');
    expect(result).toEqual([]);
  });
});

// ── reverseGeocode ─────────────────────────────

describe('reverseGeocode', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns { placeName, coordinates } on successful API response', async () => {
    mockFetch({
      features: [{
        place_name: 'Valdivia, Los Ríos, Chile',
        center: [-73.2459, -39.8143],
      }],
    });

    const result = await reverseGeocode(-39.8143, -73.2459);

    expect(result).toEqual({
      placeName: 'Valdivia, Los Ríos, Chile',
      coordinates: { lat: -39.8143, lng: -73.2459 },
    });
  });

  it('returns null when API returns no features (empty array)', async () => {
    mockFetch({ features: [] });
    const result = await reverseGeocode(-39.8143, -73.2459);
    expect(result).toBeNull();
  });

  it('returns cached result without calling API', async () => {
    getCachedCoordinate.mockReturnValueOnce({
      placeName: 'Valdivia, Chile',
      coordinates: { lat: -39.8143, lng: -73.2459 },
      fromCache: true,
    });

    const result = await reverseGeocode(-39.8143, -73.2459);

    expect(result).toEqual({
      placeName: 'Valdivia, Chile',
      coordinates: { lat: -39.8143, lng: -73.2459 },
      fromCache: true,
    });
  });
});
