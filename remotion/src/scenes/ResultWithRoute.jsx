// Scene 7: ResultWithRoute — el "money shot" del video. El resultado del cálculo
// ya está visible (apareció en la escena 5 después del reload). Acá el foco es
// la animación de la ruta dibujándose en el mapa, de origen a destino.
// Duración: 240 frames (8 segundos a 30fps).
//
// Zoom: 1.0 (vista completa para mostrar todo el resultado).
// Cross-fade de la ruta: 2 segundos (frames 0-60), luego hold por 6s.

import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData } from '../data';

const ROUTE_ANIMATION_DURATION = 60; // 2 segundos — el cross-fade de la ruta debe ser rápido

export function ResultWithRoute() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación de la ruta: progress 0 → 1 durante los primeros 180 frames
  const routeProgress = interpolate(
    frame,
    [0, ROUTE_ANIMATION_DURATION],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    }
  );

  // Pequeño "scale in" del bloque de precio al inicio (efecto landing)
  const priceSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });
  // Mapeo: priceSpring va de 0 a ~1 (overshoot), lo uso para escalar 1.05 → 1
  const priceScale = 1.05 - 0.05 * Math.min(priceSpring, 1);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <CalculatorFrame
        address={demoData.fullAddress}
        showAddressCursor={false}
        showClearButton={true}
        selectedCourier={`${demoData.courierName} - ${demoData.courierPhone}`}
        dropdownOpen={false}
        buttonDisabled={false}
        showResults={true}
        resultAppearing={true}
        routeProgress={routeProgress}
        priceScale={priceScale}
        calderos={demoData.postCalculateCalderos}
        searchFocused={false}
        courierFocused={false}
        zoom={1}
        zoomOriginX="50%"
        zoomOriginY="50%"
      />
    </div>
  );
}