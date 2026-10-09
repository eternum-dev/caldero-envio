// MapRouteAnimation — el "mapa" del video. Usa las screenshots reales de
// Mapbox para el origen (sin ruta) y el resultado (con ruta + destino).
// En scenes 1-6 muestra el mapa solo con el pin de origen. En scene 7 hace
// un cross-fade al mapa con la ruta calculada.
//
// Estilo: monocromo dorado sobre superficie oscura. Los pins y la ruta ya
// están dibujados en las screenshots, no animamos la polyline manualmente.

import { Img, staticFile } from 'remotion';
import { tokens } from '../data';

export function MapRouteAnimation({ progress = 0 }) {
  // El "progress" representa el cross-fade entre el mapa-vacío y el mapa-con-ruta.
  // progress=0 → mapa-valdivia-origen (solo pin origen)
  // progress=1 → mapa-valdivia-con-ruta (ruta + pin destino)
  const fadeOut = 1 - progress;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: tokens.surfaceLow,
        overflow: 'hidden',
      }}
    >
      {/* Mapa base: solo con el pin de origen (visible siempre) */}
      <Img
        src={staticFile('mapa-valdivia-origen.png')}
        alt="Mapa de Valdivia con el origen"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Mapa con ruta calculada (fade-in según progress) */}
      <Img
        src={staticFile('mapa-valdivia-con-ruta.png')}
        alt="Mapa de Valdivia con la ruta al destino"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: progress,
        }}
      />

      {/* Overlay sutil de gradiente abajo-izquierda para que se vea el "Origen"
          label y el attribution del Mapbox (ya está en la screenshot, pero el
          overlay mejora la legibilidad) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom right, transparent 70%, rgba(20,18,16,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Opcional: vignette sutil para integrarlo mejor con el resto del UI */}
      {fadeOut > 0.1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 50%, ${tokens.bg} 100%)`,
            opacity: fadeOut * 0.3,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}