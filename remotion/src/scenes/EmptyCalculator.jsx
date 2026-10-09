// Scene 1: EmptyCalculator — estado inicial de la calculadora.
// Cursor SIEMPRE visible (sin blink on/off — el blink se percibía como
// focus/blur repetidos en el input). El input aparece "focused" desde el
// primer frame, listo para que el usuario empiece a tipear.
// Zoom: 1.0 (vista normal al cargar).

import { useCurrentFrame, interpolate } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';

export function EmptyCalculator() {
  const frame = useCurrentFrame();

  // Cursor con un pulse SUTIL de opacity (no on/off) para que se vea "vivo"
  // sin sentirse como clicks repetidos. Range: 0.7 → 1.0 cada 30 frames.
  const cursorOpacity = 0.85 + 0.15 * Math.sin((frame / 30) * Math.PI * 2) * 0.5 + 0.075;

  return (
    <CalculatorFrame
      address=""
      showAddressCursor={true}
      cursorOpacity={cursorOpacity}
      selectedCourier={null}
      dropdownOpen={false}
      buttonDisabled={true}
      showResults={false}
      routeProgress={0}
      searchFocused={false}
      courierFocused={false}
      zoom={1}
      zoomOriginX="50%"
      zoomOriginY="50%"
    />
  );
}