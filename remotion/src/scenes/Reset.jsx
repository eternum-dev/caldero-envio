// Scene 8: Reset — el usuario clickea "Nueva búsqueda" para volver a empezar.
// Esta escena está al final del video y su estado final coincide con el
// estado inicial de la Scene 1, así cuando el video loop se vuelve seamless.
//
// Duración: 30 frames (1 segundo a 30fps).
//
// Timing:
//   - Frame 0-3: botón "Nueva búsqueda" presionado (scale 0.98, feedback)
//   - Frame 3-10: form se vacía (address → "", repartidor → null, calderos → 199)
//   - Frame 10-20: bloque de resultado desaparece (opacity → 0)
//   - Frame 20-30: mapa cross-fade back al origen (routeProgress 1 → 0)
//
// El cursor del input vuelve a parpadear (igual que en scene 1) para que el
// loop arranque de la misma forma visual.

import { useCurrentFrame, interpolate } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData, tokens } from '../data';

const BUTTON_PRESS_START = 1;
const FORM_CLEAR_START = 4;
const RESULT_FADE_START = 8;
const MAP_FADE_START = 12;
const CURSOR_BLINK_FRAME = 25;

export function Reset() {
  const frame = useCurrentFrame();

  // El botón "Nueva búsqueda" se presiona brevemente al inicio
  const buttonPressed = frame >= BUTTON_PRESS_START && frame < 4;

  // El form se vacía: address vacío, sin repartidor, botón Calcular deshabilitado
  const formCleared = frame >= FORM_CLEAR_START;

  // El resultado desaparece gradualmente
  const resultAppearing = interpolate(
    frame,
    [RESULT_FADE_START, RESULT_FADE_START + 8],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ) > 0;

  // La polyline vuelve a 0 (mapa origen)
  const routeProgress = interpolate(
    frame,
    [MAP_FADE_START, MAP_FADE_START + 12],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Calderos vuelven a 199
  const calderos = formCleared ? demoData.initialCalderos : demoData.postCalculateCalderos;

  // Cursor visible al final (sin blink) — preparado para que el loop arranque
  // sin el efecto de focus/blur repetidos
  const showCursor = frame >= CURSOR_BLINK_FRAME;
  const cursorOpacity = 0.95;

  // Click pulse: aparece en el momento del press del botón "Nueva búsqueda"
  const clickPulse = {
    x: 322, // centro horizontal del form
    y: 600, // centro vertical del botón "Nueva búsqueda" (ajustado empíricamente)
    startFrame: 1,
    durationFrames: 18,
    color: tokens.gold,
  };

  return (
    <CalculatorFrame
      address=""
      showAddressCursor={showCursor}
      cursorOpacity={cursorOpacity}
      showClearButton={false}
      selectedCourier={null}
      dropdownOpen={false}
      buttonDisabled={true}
      buttonPressed={buttonPressed}
      showResults={resultAppearing}
      resultAppearing={resultAppearing}
      routeProgress={routeProgress}
      calderos={calderos}
      searchFocused={false}
      courierFocused={false}
      clickPulse={clickPulse}
      zoom={1}
      zoomOriginX="50%"
      zoomOriginY="50%"
    />
  );
}