// Scene 2: TypingAddress — el texto "Ruben Dario 146" se escribe letra por letra.
// Duración: 120 frames (4 segundos a 30fps).
//
// Timing del typing:
//   - Frames 0-15: cursor parpadea, input vacío
//   - Frames 15-105: cada 6 frames aparece una letra (15 chars * 6 frames = 90 frames)
//   - Frames 105-120: dirección completa, cursor parpadeando al final
//
// A partir del frame 60 también aparece el X de "limpiar" (porque ya hay contenido).

import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData } from '../data';

const FULL_TEXT = demoData.addressPartial;
const TYPING_START_FRAME = 12;
const FRAMES_PER_CHAR = 6;

export function TypingAddress() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsTyped = Math.max(
    0,
    Math.floor((frame - TYPING_START_FRAME) / FRAMES_PER_CHAR)
  );
  const visibleText = FULL_TEXT.substring(0, Math.min(charsTyped, FULL_TEXT.length));
  const isTypingComplete = charsTyped >= FULL_TEXT.length;

  // Cursor visible SIEMPRE (sin blink on/off)
  const showCursor = frame >= TYPING_START_FRAME - 2;
  const showClear = charsTyped >= 4;

  // Zoom in con spring — más pronunciado (1.0 → 1.08) y rápido pero suave.
  // Config: damping 18 + stiffness 100 = snappy con leve overshoot.
  const springProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.5 },
  });
  const zoom = interpolate(springProgress, [0, 1], [1, 1.08]);

  return (
    <CalculatorFrame
      address={visibleText}
      showAddressCursor={showCursor}
      showClearButton={showClear}
      selectedCourier={null}
      dropdownOpen={false}
      autocompleteOpen={false}
      buttonDisabled={true}
      showResults={false}
      routeProgress={0}
      searchFocused={true}
      courierFocused={false}
      zoom={zoom}
      zoomOriginX="8%"
      zoomOriginY="30%"
    />
  );
}