import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_GL_TOKEN } from '../config/mapbox';
import { SANTIAGO_CENTER } from '../config/constants';

mapboxgl.accessToken = MAPBOX_GL_TOKEN;

/**
 * Custom brand colors for the map — matches our dark/gold palette.
 */
const BRAND = {
  bg: '#1e1a16',         // bg-surface (más claro)
  land: '#1e1a16',       // bg-surface
  blocks: '#141210',     // bg-bg
  water: '#141210',      // bg-bg (matching bg)
  ink: '#f0e8dc',        // text-ink
  muted: '#9a8878',      // text-muted
  gold: '#F5AF46',       // gold DEFAULT
  goldDim: '#c8893a',    // gold-dim → café para calles
  roadMajor: '#27211a',  // bg-surface-2
  roadMinor: '#27211a',  // bg-surface-2
};

/**
 * Apply brand theme colors to a loaded Mapbox style — minimalist mode.
 * Injects a custom background layer, keeps roads + water + major labels,
 * hides everything else (buildings, landuse, parks, POIs, 3D).
 */
function applyBrandTheme(map) {
  const style = map.getStyle();
  if (!style || !style.layers) return;

  // ── Force brand background ──
  // Find the first non-background layer to use as insertion anchor
  const anchorId = style.layers.find(l => l.type !== 'background')?.id;
  // Remove any existing background layers
  style.layers.filter(l => l.type === 'background').forEach(l => {
    try { map.removeLayer(l.id); } catch {}
  });
  // Add our branded background behind the anchor
  map.addLayer({
    id: 'brand-bg',
    type: 'background',
    paint: { 'background-color': BRAND.bg }
  }, anchorId);

  // Re-fetch layers after modification
  const updatedLayers = map.getStyle().layers;

  const hide = (id) => {
    try { map.setLayoutProperty(id, 'visibility', 'none'); } catch {}
  };

  updatedLayers.forEach(layer => {
    const id = layer.id;
    if (id === 'brand-bg') return;

    // ── Water (keep, very subtle) ──
    if (id.includes('water') && layer.type === 'fill') {
      map.setPaintProperty(id, 'fill-color', BRAND.water);
      return;
    }

    // ── Hide all other fills (buildings, landuse, parks, etc.) ──
    if (layer.type === 'fill') {
      hide(id);
      return;
    }

    // ── Roads (keep visible, styled) ──
    const isRoad = layer.type === 'line' && !id.includes('bridge') && !id.includes('tunnel')
      && !id.includes('ferry') && !id.includes('outline') && !id.includes('pattern')
      && (id.includes('road') || id.includes('street') || id.includes('path')
        || id.includes('primary') || id.includes('secondary') || id.includes('trunk')
        || id.includes('motorway') || id.includes('service') || id.includes('pedestrian'));
    if (isRoad) {
      const isMajor = id.includes('primary') || id.includes('secondary')
        || id.includes('trunk') || id.includes('motorway') || id.includes('link');
      map.setPaintProperty(id, 'line-color', isMajor ? BRAND.roadMajor : BRAND.roadMinor);
      return;
    }

    // ── Hide non-road lines ──
    if (layer.type === 'line') {
      hide(id);
      return;
    }

    // ── Labels — keep majors (cities, roads), hide POIs ──
    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
      if (id.includes('poi') || id.includes('airport')) {
        hide(id);
      } else {
        try { map.setPaintProperty(id, 'text-color', BRAND.ink); } catch {}
        try { map.setPaintProperty(id, 'text-halo-color', BRAND.bg); } catch {}
        try { map.setPaintProperty(id, 'text-halo-width', 1); } catch {}
      }
      return;
    }

    // ── Hide anything else ──
    hide(id);
  });
}

export default function useMapboxMap(mapContainerRef, zoomTo) {
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || map.current) return;

    const center = zoomTo || SANTIAGO_CENTER;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [center.lng, center.lat],
      zoom: 13,
    });

    map.current.on('load', () => {
      try {
        applyBrandTheme(map.current);
      } catch (e) {
        console.warn('Brand theme apply failed:', e);
      }
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const target = zoomTo || SANTIAGO_CENTER;
    map.current.flyTo({ center: [target.lng, target.lat], zoom: 13, duration: 1000 });
  }, [mapLoaded, zoomTo]);

  return { mapLoaded, map };
}
