import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCachedAddress,
  setCachedAddress,
  getRecentAddresses,
  clearCache,
  getCachedCoordinate,
  setCachedCoordinate,
} from '../../src/services/cacheService';

// ── Mock localStorage ───────────────────────────

function createMockStorage() {
  const store = {};
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    key: vi.fn(index => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    __store: store,
  };
}

let mockStorage;

describe('cacheService', () => {
  beforeEach(() => {
    mockStorage = createMockStorage();
    vi.stubGlobal('localStorage', mockStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setCachedAddress', () => {
    it('stores data with prefix, country, and address', () => {
      setCachedAddress('Av. Siempre 123', { coordinates: { lat: -33, lng: -70 } }, 'cl');

      const key = mockStorage.__store['caldero_address_cl_av. siempre 123'];
      expect(key).toBeDefined();
      const parsed = JSON.parse(key);
      expect(parsed.coordinates).toEqual({ lat: -33, lng: -70 });
      expect(parsed.text).toBe('Av. Siempre 123');
      expect(parsed.cachedAt).toBeDefined();
    });

    it('defaults country to cl', () => {
      setCachedAddress('Test 456', { coordinates: { lat: 0, lng: 0 } });

      const key = Object.keys(mockStorage.__store)[0];
      expect(key).toContain('caldero_address_cl_test 456');
    });
  });

  describe('getCachedAddress', () => {
    it('returns parsed data with fromCache flag when found', () => {
      setCachedAddress('Av. Siempre 123', { coordinates: { lat: -33, lng: -70 } });

      const result = getCachedAddress('Av. Siempre 123');
      expect(result).toEqual({
        coordinates: { lat: -33, lng: -70 },
        text: 'Av. Siempre 123',
        cachedAt: expect.any(String),
        fromCache: true,
      });
    });

    it('returns null when not found', () => {
      expect(getCachedAddress('Dirección inexistente')).toBeNull();
    });

    it('is case-insensitive for address', () => {
      setCachedAddress('Av. Siempre 123', { coordinates: { lat: -33, lng: -70 } });

      expect(getCachedAddress('AV. SIEMPRE 123')).not.toBeNull();
      expect(getCachedAddress('av. siempre 123')).not.toBeNull();
    });
  });

  describe('getRecentAddresses', () => {
    it('returns all cached addresses', () => {
      setCachedAddress('Address A', { coordinates: { lat: 1, lng: 1 } });
      setCachedAddress('Address B', { coordinates: { lat: 2, lng: 2 } });

      const recent = getRecentAddresses(10);
      expect(recent.length).toBe(2);
    });

    it('respects the limit parameter', () => {
      setCachedAddress('A', { coordinates: { lat: 1, lng: 1 } });
      setCachedAddress('B', { coordinates: { lat: 2, lng: 2 } });
      setCachedAddress('C', { coordinates: { lat: 3, lng: 3 } });

      expect(getRecentAddresses(2).length).toBe(2);
    });
  });

  describe('clearCache', () => {
    it('removes all cached address entries', () => {
      setCachedAddress('A', { coordinates: { lat: 1, lng: 1 } });
      setCachedAddress('B', { coordinates: { lat: 2, lng: 2 } });
      expect(getRecentAddresses(10).length).toBe(2);

      clearCache();

      expect(getRecentAddresses(10).length).toBe(0);
    });

    it('does not affect non-cache localStorage keys', () => {
      localStorage.setItem('other_key', 'value');
      setCachedAddress('A', { coordinates: { lat: 1, lng: 1 } });

      clearCache();

      expect(localStorage.getItem('other_key')).toBe('value');
    });

    it('also removes coordinate cache entries', () => {
      setCachedCoordinate(-39.8143, -73.2459, { placeName: 'Test', coordinates: { lat: -39.8143, lng: -73.2459 } });
      expect(getCachedCoordinate(-39.8143, -73.2459)).not.toBeNull();

      clearCache();

      expect(getCachedCoordinate(-39.8143, -73.2459)).toBeNull();
    });
  });

  // ── Coordinate cache ────────────────────────────

  describe('getCachedCoordinate', () => {
    it('returns null when no entry exists', () => {
      expect(getCachedCoordinate(-33.45, -70.66)).toBeNull();
    });

    it('returns data with fromCache flag when entry exists', () => {
      setCachedCoordinate(-39.8143, -73.2459, { placeName: 'Valdivia', coordinates: { lat: -39.8143, lng: -73.2459 } });

      const result = getCachedCoordinate(-39.8143, -73.2459);
      expect(result).not.toBeNull();
      expect(result.placeName).toBe('Valdivia');
      expect(result.coordinates).toEqual({ lat: -39.8143, lng: -73.2459 });
      expect(result.fromCache).toBe(true);
    });

    it('shares cache key for nearby coordinates (4 decimal rounding)', () => {
      // -39.81431 and -39.81432 both round to -39.8143 at 4 decimals
      // -73.24592 and -73.24593 both round to -73.2459 at 4 decimals
      setCachedCoordinate(-39.81431, -73.24592, { placeName: 'Nearby', coordinates: { lat: -39.8143, lng: -73.2459 } });

      const result = getCachedCoordinate(-39.81432, -73.24593);
      expect(result).not.toBeNull();
      expect(result.placeName).toBe('Nearby');
      expect(result.fromCache).toBe(true);
    });
  });

  describe('setCachedCoordinate', () => {
    it('stores coordinate data with rounded key and cachedAt timestamp', () => {
      setCachedCoordinate(-33.45678, -70.65432, { placeName: 'Santiago', coordinates: { lat: -33.4568, lng: -70.6543 } });

      // Verify the data was stored (getCachedCoordinate returns it)
      const result = getCachedCoordinate(-33.45678, -70.65432);
      expect(result).not.toBeNull();
      expect(result.placeName).toBe('Santiago');
      expect(result.cachedAt).toBeDefined();
    });
  });
});
