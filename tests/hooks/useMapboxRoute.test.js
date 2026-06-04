import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ── Mock mapbox-gl ──────────────────────────────

const {
  mockMap, mockMarker, mockLngLatBounds, MarkerCtor,
} = vi.hoisted(() => {
  const mm = {
    on: vi.fn(),
    remove: vi.fn(),
    flyTo: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    fitBounds: vi.fn(),
    getLayer: vi.fn(() => false),
    getSource: vi.fn(() => false),
  };
  const mk = {
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };
  const bounds = { extend: vi.fn().mockReturnThis() };
  const MarkerFn = vi.fn(() => mk);
  return {
    mockMap: mm,
    mockMarker: mk,
    mockLngLatBounds: bounds,
    MarkerCtor: MarkerFn,
  };
});

vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => mockMap),
    Marker: MarkerCtor,
    accessToken: '',
    LngLatBounds: vi.fn(() => mockLngLatBounds),
  },
}));

// ── SUT ─────────────────────────────────────────

import useMapboxRoute from '../../src/hooks/useMapboxRoute';

// ── Helpers ─────────────────────────────────────

const ORIGIN = { lat: -33.45, lng: -70.66 };
const DEST = { lat: -34.60, lng: -58.38 };
const ROUTE_GEO = {
  type: 'LineString',
  coordinates: [[-70.66, -33.45], [-58.38, -34.60]],
};

function makeMapRef() {
  return { current: mockMap };
}

// ── Tests ───────────────────────────────────────

describe('useMapboxRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Guard clause ──

  it('does nothing when map is not loaded', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: false, origin: ORIGIN,
    }));
    expect(MarkerCtor).not.toHaveBeenCalled();
  });

  it('does nothing when map.current is null', () => {
    renderHook(() => useMapboxRoute({
      map: { current: null }, mapLoaded: true, origin: ORIGIN,
    }));
    expect(MarkerCtor).not.toHaveBeenCalled();
  });

  // ── Origin marker ──

  it('creates origin marker at origin coordinates', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true, origin: ORIGIN,
    }));

    expect(MarkerCtor).toHaveBeenCalledWith(
      expect.objectContaining({ color: '#3b82f6' })
    );
    expect(mockMarker.setLngLat).toHaveBeenCalledWith([ORIGIN.lng, ORIGIN.lat]);
    expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap);
  });

  it('creates origin marker at SANTIAGO_CENTER when no origin', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true,
    }));

    expect(mockMarker.setLngLat).toHaveBeenCalledWith([-70.6693, -33.4489]);
  });

  it('flies to origin when origin is provided', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true, origin: ORIGIN,
    }));

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [ORIGIN.lng, ORIGIN.lat], zoom: 15 })
    );
  });

  it('removes old origin marker when origin changes', () => {
    const { rerender } = renderHook(
      ({ origin }) => useMapboxRoute({ map: makeMapRef(), mapLoaded: true, origin }),
      { initialProps: { origin: ORIGIN } }
    );

    rerender({ origin: { lat: -33.0, lng: -71.0 } });

    expect(mockMarker.remove).toHaveBeenCalled();
  });

  // ── Destination marker ──

  it('creates destination marker when destination is provided', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true, origin: ORIGIN, destination: DEST,
    }));

    expect(MarkerCtor).toHaveBeenCalledWith(
      expect.objectContaining({ color: '#f97316' })
    );
    expect(mockMarker.setLngLat).toHaveBeenCalledWith([DEST.lng, DEST.lat]);
  });

  it('does not create destination marker when no destination', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true, origin: ORIGIN,
    }));

    // Only origin marker should be created
    expect(MarkerCtor).toHaveBeenCalledTimes(1);
  });

  it('removes old destination marker and route on re-render', () => {
    mockMap.getLayer.mockReturnValue(true);
    mockMap.getSource.mockReturnValue(true);

    const { rerender } = renderHook(
      ({ dest }) => useMapboxRoute({
        map: makeMapRef(), mapLoaded: true, origin: ORIGIN, destination: dest,
      }),
      { initialProps: { dest: DEST } }
    );

    rerender({ dest: { lat: -33.0, lng: -71.0 } });

    expect(mockMarker.remove).toHaveBeenCalled();
    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.removeSource).toHaveBeenCalled();
  });

  // ── Route line ──

  it('adds route layer with geometry when routeGeometry is provided', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true,
      origin: ORIGIN, destination: DEST,
      routeGeometry: ROUTE_GEO,
    }));

    expect(mockMap.addSource).toHaveBeenCalledWith(
      'route-line',
      expect.objectContaining({
        type: 'geojson',
        data: expect.objectContaining({
          geometry: ROUTE_GEO,
        }),
      })
    );
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'route-line' })
    );
  });

  it('adds straight line when routeCalculated is true but no geometry', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true,
      origin: ORIGIN, destination: DEST,
      routeCalculated: true,
    }));

    expect(mockMap.addSource).toHaveBeenCalled();
    const sourceCall = mockMap.addSource.mock.calls[0][1];
    const coords = sourceCall.data.geometry.coordinates;
    expect(coords).toEqual([[ORIGIN.lng, ORIGIN.lat], [DEST.lng, DEST.lat]]);
  });

  it('fits bounds to both markers when no route at all', () => {
    renderHook(() => useMapboxRoute({
      map: makeMapRef(), mapLoaded: true,
      origin: ORIGIN, destination: DEST,
    }));

    expect(mockMap.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ padding: 80 })
    );
  });
});
