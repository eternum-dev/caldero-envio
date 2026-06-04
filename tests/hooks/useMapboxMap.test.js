import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock mapbox-gl ──────────────────────────────

const {
  mockMap, mockMarker, mockLngLatBounds, MapCtor, MarkerCtor,
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
  const MapFn = vi.fn(() => mm);
  const MarkerFn = vi.fn(() => mk);
  return {
    mockMap: mm,
    mockMarker: mk,
    mockLngLatBounds: bounds,
    MapCtor: MapFn,
    MarkerCtor: MarkerFn,
  };
});

vi.mock('mapbox-gl', () => ({
  default: {
    Map: MapCtor,
    Marker: MarkerCtor,
    accessToken: '',
    LngLatBounds: vi.fn(() => mockLngLatBounds),
  },
}));

// ── SUT ─────────────────────────────────────────

import useMapboxMap from '../../src/hooks/useMapboxMap';

// ── Helpers ─────────────────────────────────────

function createContainerRef() {
  const div = document.createElement('div');
  return { current: div };
}

// ── Tests ───────────────────────────────────────

describe('useMapboxMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Map instance when container ref exists', () => {
    const containerRef = createContainerRef();
    renderHook(() => useMapboxMap(containerRef));
    expect(MapCtor).toHaveBeenCalledTimes(1);
  });

  it('passes center from zoomTo to Map constructor', () => {
    const containerRef = createContainerRef();
    renderHook(() => useMapboxMap(containerRef, { lat: -33.45, lng: -70.66 }));

    expect(MapCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [-70.66, -33.45],
        zoom: 13,
      })
    );
  });

  it('does not create a map if container ref has no current element', () => {
    const emptyRef = { current: null };
    renderHook(() => useMapboxMap(emptyRef));
    expect(MapCtor).not.toHaveBeenCalled();
  });

  it('sets mapLoaded to true on map load event', () => {
    const containerRef = createContainerRef();
    const { result } = renderHook(() => useMapboxMap(containerRef));

    expect(result.current.mapLoaded).toBe(false);

    act(() => {
      const loadCb = mockMap.on.mock.calls.find(c => c[0] === 'load')[1];
      loadCb();
    });

    expect(result.current.mapLoaded).toBe(true);
  });

  it('removes map instance on unmount', () => {
    const containerRef = createContainerRef();
    const { unmount } = renderHook(() => useMapboxMap(containerRef));
    unmount();
    expect(mockMap.remove).toHaveBeenCalledTimes(1);
  });

  it('returns map ref pointing to the created Map instance', () => {
    const containerRef = createContainerRef();
    const { result } = renderHook(() => useMapboxMap(containerRef));
    expect(result.current.map.current).toBe(mockMap);
  });

  it('only creates one map instance on re-render', () => {
    const containerRef = createContainerRef();
    const { rerender } = renderHook(() => useMapboxMap(containerRef));
    rerender();
    rerender();
    expect(MapCtor).toHaveBeenCalledTimes(1);
  });

  it('calls flyTo when zoomTo changes after map is loaded', () => {
    const containerRef = createContainerRef();
    const { rerender } = renderHook(
      ({ zoomTo }) => useMapboxMap(containerRef, zoomTo),
      { initialProps: { zoomTo: { lat: -33.45, lng: -70.66 } } }
    );

    act(() => {
      const loadCb = mockMap.on.mock.calls.find(c => c[0] === 'load')[1];
      loadCb();
    });

    rerender({ zoomTo: { lat: -34.60, lng: -58.38 } });

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [-58.38, -34.60] })
    );
  });
});
