import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mocks ───────────────────────────────────────

const {
  mockStore, emptyDelivery, mockSetters,
  mockGeocodeAddress, mockGetDistance,
  mockGenerateGoogleMapsLink, mockDecodePolyline, mockCalculatePrice,
} = vi.hoisted(() => ({
  mockStore: {
    country: 'cl',
    originCoordinates: { lat: -33.45, lng: -70.66 },
    pricingRules: [{ minKm: 0, maxKm: 5, price: 1000 }],
  },
  emptyDelivery: {
    address: '',
    coordinates: null,
    courierId: '',
    distance: null,
    time: null,
    price: null,
    routeUrl: null,
    mapImage: null,
    routeGeometry: null,
  },
  mockSetters: {
    setAddress: vi.fn(),
    setCourier: vi.fn(),
    setResult: vi.fn(),
    reset: vi.fn(),
  },
  mockGeocodeAddress: vi.fn(),
  mockGetDistance: vi.fn(),
  mockGenerateGoogleMapsLink: vi.fn(),
  mockDecodePolyline: vi.fn(),
  mockCalculatePrice: vi.fn(() => 1500),
}));

let currentDelivery = { ...emptyDelivery };

vi.mock('../../src/contexts/StoreContext', () => ({
  useStore: () => ({ store: mockStore }),
}));

vi.mock('../../src/contexts/DeliveryContext', () => ({
  useDelivery: () => ({ delivery: currentDelivery, ...mockSetters }),
}));

vi.mock('../../src/services/mapService', () => ({
  geocodeAddress: mockGeocodeAddress,
  getDistance: mockGetDistance,
  generateGoogleMapsLink: mockGenerateGoogleMapsLink,
  decodePolyline: mockDecodePolyline,
}));

vi.mock('../../src/services/deliveryService', () => ({
  calculatePrice: mockCalculatePrice,
}));

// ── SUT ─────────────────────────────────────────

import { useDeliveryCalculator } from '../../src/hooks/useDeliveryCalculator';

// ── Tests ───────────────────────────────────────

describe('useDeliveryCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentDelivery = { ...emptyDelivery };
  });

  describe('initial state', () => {
    it('returns delivery, loading, and error from initial state', () => {
      const { result } = renderHook(() => useDeliveryCalculator());

      expect(result.current.delivery).toEqual(emptyDelivery);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('exposes setCourier and reset from context', () => {
      const { result } = renderHook(() => useDeliveryCalculator());

      result.current.setCourier('courier-2');
      expect(mockSetters.setCourier).toHaveBeenCalledWith('courier-2');

      result.current.reset();
      expect(mockSetters.reset).toHaveBeenCalled();
    });
  });

  describe('searchAddress', () => {
    it('sets loading to false after search completes', async () => {
      mockGeocodeAddress.mockResolvedValue({ coordinates: { lat: -33.45, lng: -70.66 } });

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => {
        await result.current.searchAddress('Av. Siempre Viva 123');
      });

      expect(result.current.loading).toBe(false);
    });

    it('geocodes address and calls setAddress on success', async () => {
      const coords = { lat: -33.45, lng: -70.66 };
      mockGeocodeAddress.mockResolvedValue({ coordinates: coords });

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => {
        await result.current.searchAddress('Av. Siempre Viva 123');
      });

      expect(mockGeocodeAddress).toHaveBeenCalledWith('Av. Siempre Viva 123', 'cl');
      expect(mockSetters.setAddress).toHaveBeenCalledWith('Av. Siempre Viva 123', coords);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error when geocoding fails', async () => {
      mockGeocodeAddress.mockRejectedValue(new Error('Dirección no encontrada'));

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => {
        await result.current.searchAddress('Dirección inválida');
      });

      expect(result.current.error).toBe('Dirección no encontrada');
      expect(result.current.loading).toBe(false);
      expect(mockSetters.setAddress).not.toHaveBeenCalled();
    });

    it('does nothing for empty address', async () => {
      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => {
        await result.current.searchAddress('');
      });

      expect(mockGeocodeAddress).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('calculate', () => {
    it('returns early if no coordinates', async () => {
      currentDelivery.courierId = 'courier-1';

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => { await result.current.calculate(); });

      expect(mockGetDistance).not.toHaveBeenCalled();
    });

    it('returns early if no courierId', async () => {
      currentDelivery.coordinates = { lat: -33.45, lng: -70.66 };

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => { await result.current.calculate(); });

      expect(mockGetDistance).not.toHaveBeenCalled();
    });

    it('calculates and sets result on success', async () => {
      currentDelivery.coordinates = { lat: -34.60, lng: -58.38 };
      currentDelivery.courierId = 'courier-1';

      mockGetDistance.mockResolvedValue({
        distance: 5.2, time: 15, geometry: 'encoded_polyline',
      });
      mockDecodePolyline.mockReturnValue([[-70.66, -33.45], [-58.38, -34.60]]);
      mockGenerateGoogleMapsLink.mockReturnValue('https://maps.google.com/...');

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => { await result.current.calculate(); });

      expect(mockGetDistance).toHaveBeenCalledWith(
        mockStore.originCoordinates,
        { lat: -34.60, lng: -58.38 }
      );
      expect(mockSetters.setResult).toHaveBeenCalledWith({
        distance: 5.2,
        time: 15,
        price: 1500,
        routeUrl: 'https://maps.google.com/...',
        mapImage: 'https://maps.google.com/...',
        routeGeometry: {
          type: 'LineString',
          coordinates: [[-70.66, -33.45], [-58.38, -34.60]],
        },
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets routeGeometry to null when polyline is empty', async () => {
      currentDelivery.coordinates = { lat: -34.60, lng: -58.38 };
      currentDelivery.courierId = 'courier-1';

      mockGetDistance.mockResolvedValue({
        distance: 5.2, time: 15, geometry: '',
      });
      mockDecodePolyline.mockReturnValue([]);
      mockGenerateGoogleMapsLink.mockReturnValue('https://maps.google.com/...');

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => { await result.current.calculate(); });

      expect(mockSetters.setResult).toHaveBeenCalledWith(
        expect.objectContaining({ routeGeometry: null })
      );
    });

    it('sets error when distance calculation fails', async () => {
      currentDelivery.coordinates = { lat: -34.60, lng: -58.38 };
      currentDelivery.courierId = 'courier-1';

      mockGetDistance.mockRejectedValue(new Error('No se pudo calcular la ruta'));

      const { result } = renderHook(() => useDeliveryCalculator());
      await act(async () => { await result.current.calculate(); });

      expect(result.current.error).toBe('No se pudo calcular la ruta');
      expect(result.current.loading).toBe(false);
      expect(mockSetters.setResult).not.toHaveBeenCalled();
    });
  });
});
