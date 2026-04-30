import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN } from '../../config/mapbox';
import { SANTIAGO_CENTER } from '../../config/constants';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const ORIGIN_COLOR = '#3b82f6';
const DESTINATION_COLOR = '#f97316';

export default function MapPreview({
  origin,
  destination,
  center,
  routeGeometry,
  className = '',
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerId = 'route-line';

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const centerCoord = center || origin || SANTIAGO_CENTER;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerCoord.lng, centerCoord.lat],
      zoom: 13,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const centerCoord = center || origin || SANTIAGO_CENTER;
    map.current.flyTo({
      center: [centerCoord.lng, centerCoord.lat],
      zoom: 13,
      duration: 1000,
    });
  }, [mapLoaded, center]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
    }

    const coordToUse = origin || SANTIAGO_CENTER;
    originMarkerRef.current = new mapboxgl.Marker({ color: ORIGIN_COLOR })
      .setLngLat([coordToUse.lng, coordToUse.lat])
      .addTo(map.current);

    if (origin) {
      map.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [mapLoaded, origin]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeLayerId)) {
      map.current.removeSource(routeLayerId);
    }

    if (!destination) return;

    const originCoord = origin || SANTIAGO_CENTER;

    destinationMarkerRef.current = new mapboxgl.Marker({ color: DESTINATION_COLOR })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map.current);

    if (routeGeometry) {
      map.current.addSource(routeLayerId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeGeometry,
        },
      });

      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeLayerId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': DESTINATION_COLOR,
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      routeGeometry.coordinates.forEach(coord => bounds.extend(coord));
      bounds.extend([originCoord.lng, originCoord.lat]);

      map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    } else {
      map.current.addSource(routeLayerId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [originCoord.lng, originCoord.lat],
              [destination.lng, destination.lat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeLayerId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': DESTINATION_COLOR,
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([originCoord.lng, originCoord.lat]);
      bounds.extend([destination.lng, destination.lat]);

      map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [destination, origin, mapLoaded, routeGeometry]);

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px', height: '400px' }}>
      <div ref={mapContainer} className="w-full rounded-md" style={{ height: '400px' }} />
      {!MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-medium rounded-md">
          <p className="text-on_surface_variant text-sm">Mapbox token no configurado</p>
        </div>
      )}
    </div>
  );
}