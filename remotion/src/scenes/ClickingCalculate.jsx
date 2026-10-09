// Scene 5: ClickingCalculate — el botón "Calcular Envío" se presiona y entra
// en estado "Calculando...". Zoom in hacia el botón.

import { useCurrentFrame, interpolate } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData, tokens } from '../data';

const PRESS_START = 4;
const PRESS_END = 10;
const LOADING_START = 10;

export function ClickingCalculate() {
  const frame = useCurrentFrame();

  const calderos =
    frame >= LOADING_START ? demoData.postCalculateCalderos : demoData.initialCalderos;

  const buttonPressed = frame >= PRESS_START && frame < PRESS_END;
  const buttonLoading = frame >= LOADING_START;

  // Zoom held en 1.08 (mismo que scenes anteriores — sin más zoom in)
  const zoom = 1.08;

  // Click pulse: aparece en el momento del press (frame 4 de la scene)
  // y crece desde el centro del botón "Calcular Envío".
  const clickPulse = {
    x: 322, // centro horizontal del form
    y: 286, // centro vertical del botón "Calcular Envío" (ajustado empíricamente)
    startFrame: 4,
    durationFrames: 18,
    color: tokens.gold,
  };

  return (
    <CalculatorFrame
      address={demoData.fullAddress}
      showAddressCursor={false}
      showClearButton={true}
      selectedCourier={`${demoData.courierName} - ${demoData.courierPhone}`}
      dropdownOpen={false}
      buttonPressed={buttonPressed}
      buttonLoading={buttonLoading}
      buttonDisabled={false}
      showResults={false}
      routeProgress={0}
      calderos={calderos}
      searchFocused={false}
      courierFocused={true}
      clickPulse={clickPulse}
      zoom={zoom}
      zoomOriginX="8%"
      zoomOriginY="30%"
    />
  );
}