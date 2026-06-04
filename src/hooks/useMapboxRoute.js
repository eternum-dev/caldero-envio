import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { SANTIAGO_CENTER } from '../config/constants';

const ORIGIN_COLOR = '#3b82f6';
const DESTINATION_COLOR = '#f97316';
const ROUTE_LAYER_ID = 'route-line';

/**
 * Hook that manages origin/destination markers and route line on a Mapbox map.
 *
 * @param {React.MutableRefObject<mapboxgl.Map|null>} map
 * @param {boolean} mapLoaded
 * @param {{ lat: number, lng: number }} [origin]
 * @param {{ lat: number, lng: number }} [destination]
 * @param {object} [routeGeometry] - GeoJSON LineString geometry
 * @param {boolean} [routeCalculated] - Whether a route has been calculated
 */
export default function useMapboxRoute({ map, mapLoaded, origin, destination, routeGeometry, routeCalculated }) {
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  // ── Origin marker ──
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
    }

    const coord = origin || SANTIAGO_CENTER;
    originMarkerRef.current = new mapboxgl.Marker({ color: ORIGIN_COLOR })
      .setLngLat([coord.lng, coord.lat])
      .addTo(map.current);

    if (origin) {
      map.current.flyTo({ center: [origin.lng, origin.lat], zoom: 15, duration: 1000 });
    }
  }, [mapLoaded, origin]);

  // ── Destination marker + route line ──
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Cleanup previous
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }
    if (map.current.getLayer(ROUTE_LAYER_ID)) map.current.removeLayer(ROUTE_LAYER_ID);
    if (map.current.getSource(ROUTE_LAYER_ID)) map.current.removeSource(ROUTE_LAYER_ID);

    if (!destination) return;

    const originCoord = origin || SANTIAGO_CENTER;

    // Destination marker
    destinationMarkerRef.current = new mapboxgl.Marker({ color: DESTINATION_COLOR })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map.current);

    // Route line: real geometry or straight line
    if (routeGeometry) {
      addRouteLine(routeGeometry);
      fitBoundsToRoute(routeGeometry.coordinates, originCoord);
    } else if (routeCalculated) {
      const straightCoords = [[originCoord.lng, originCoord.lat], [destination.lng, destination.lat]];
      addRouteLine({ type: 'LineString', coordinates: straightCoords });
      fitBoundsToCoords(straightCoords);
    } else {
      // No route — just show both markers
      const bounds = new mapboxgl.LngLatBounds()
        .extend([originCoord.lng, originCoord.lat])
        .extend([destination.lng, destination.lat]);
      map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [destination, origin, mapLoaded, routeGeometry, routeCalculated]);

  function addRouteLine(geometry) {
    if (!map.current) return;
    map.current.addSource(ROUTE_LAYER_ID, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry },
    });
    map.current.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_LAYER_ID,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': DESTINATION_COLOR, 'line-width': 4, 'line-opacity': 0.8 },
    });
  }

  function fitBoundsToRoute(coords, originCoord) {
    if (!map.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    bounds.extend([originCoord.lng, originCoord.lat]);
    map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
  }

  function fitBoundsToCoords(coords) {
    if (!map.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
  }
}
