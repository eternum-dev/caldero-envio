import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCachedAddress,
  setCachedAddress,
  getRecentAddresses,
  clearCache,
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
  });
});
