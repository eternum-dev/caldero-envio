import { useRef } from 'react';
import PropTypes from 'prop-types';
import useMapboxMap from '../../hooks/useMapboxMap';
import useMapboxRoute from '../../hooks/useMapboxRoute';
import { MAPBOX_GL_TOKEN } from '../../config/mapbox';

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
    <div className={`relative rounded-[14px] border border-gold/18 overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full min-h-[300px] h-full" />
      {!MAPBOX_GL_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <p className="text-muted text-sm">Mapbox token no configurado</p>
        </div>
      )}
      {origin && (
        <div className="absolute bottom-3 left-3 bg-bg/80 border border-gold/18 rounded-[8px] px-3 py-1.5 text-xs text-muted flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Origen
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
