// Scene 6: Calculating — estado breve de "Calculando..." en el botón.
// Zoom held en 1.08 (botón), después zoom out hacia vista completa para mostrar el resultado.

import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData } from '../data';

const LOADING_START = 2;
const CALDERO_DEDUCT_START = 4;

export function Calculating() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const calderos =
    frame >= CALDERO_DEDUCT_START
      ? demoData.postCalculateCalderos
      : demoData.initialCalderos;

  const buttonLoading = frame >= LOADING_START;

  // Zoom out con spring — vuelve del form (1.08) a la vista completa (1.0)
  // Rápido pero suave: damping 18, stiffness 100.
  const springProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.5 },
  });
  const zoom = interpolate(springProgress, [0, 1], [1.08, 1.0]);

  return (
    <CalculatorFrame
      address={demoData.fullAddress}
      showAddressCursor={false}
      showClearButton={true}
      selectedCourier={`${demoData.courierName} - ${demoData.courierPhone}`}
      dropdownOpen={false}
      buttonLoading={buttonLoading}
      buttonDisabled={false}
      showResults={false}
      routeProgress={0}
      calderos={calderos}
      searchFocused={false}
      courierFocused={true}
      zoom={zoom}
      zoomOriginX="50%"
      zoomOriginY="50%"
    />
  );
}