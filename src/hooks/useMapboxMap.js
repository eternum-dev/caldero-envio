import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { SANTIAGO_CENTER } from '../config/constants';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

/**
 * Hook that initializes a Mapbox map instance inside a container ref.
 *
 * @param {React.RefObject} mapContainerRef - Ref attached to the map container div
 * @param {{ lat: number, lng: number }} [zoomTo] - Coordinates to center after load
 * @returns {{ mapLoaded: boolean, map: React.MutableRefObject<mapboxgl.Map|null> }}
 */
export default function useMapboxMap(mapContainerRef, zoomTo) {
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || map.current) return;

    const center = zoomTo || SANTIAGO_CENTER;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: 13,
    });

    map.current.on('load', () => setMapLoaded(true));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // Only run on mount — map instance must be created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const target = zoomTo || SANTIAGO_CENTER;
    map.current.flyTo({ center: [target.lng, target.lat], zoom: 13, duration: 1000 });
  }, [mapLoaded, zoomTo]);

  return { mapLoaded, map };
}
