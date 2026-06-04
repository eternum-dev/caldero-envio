import { useRef } from 'react';
import PropTypes from 'prop-types';
import useMapboxMap from '../../hooks/useMapboxMap';
import useMapboxRoute from '../../hooks/useMapboxRoute';
import { MAPBOX_ACCESS_TOKEN } from '../../config/mapbox';

/**
 * Interactive Mapbox map with origin/destination markers and optional route line.
 *
 * @param {object} props
 * @param {{ lat: number, lng: number }} [props.origin]
 * @param {{ lat: number, lng: number }} [props.destination]
 * @param {{ lat: number, lng: number }} [props.center]
 * @param {object} [props.routeGeometry]
 * @param {boolean} [props.routeCalculated]
 * @param {string} [props.className]
 */
export default function MapPreview({
  origin,
  destination,
  center,
  routeGeometry,
  routeCalculated = false,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const { mapLoaded, map } = useMapboxMap(mapContainerRef, center || origin);

  useMapboxRoute({ map, mapLoaded, origin, destination, routeGeometry, routeCalculated });

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px', height: '400px' }}>
      <div ref={mapContainerRef} className="w-full rounded-md" style={{ height: '400px' }} />
      {!MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-medium rounded-md">
          <p className="text-on-surface-variant text-sm">Mapbox token no configurado</p>
        </div>
      )}
    </div>
  );
}

MapPreview.propTypes = {
  origin: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  destination: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  routeGeometry: PropTypes.object,
  routeCalculated: PropTypes.bool,
  className: PropTypes.string,
};