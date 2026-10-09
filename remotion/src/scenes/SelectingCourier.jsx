// Scene 4: SelectingCourier — el dropdown se abre y se selecciona "Matias Jara".
// Zoom: baja gradualmente de 1.04 (input) a 1.04 (repartidor) — se mantiene
// anclado al form.

import { useCurrentFrame } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData } from '../data';

const DROPDOWN_OPEN_START = 12;
const HIGHLIGHT_START = 22;
const DROPDOWN_CLOSE_START = 50;
const FINAL_STATE_START = 58;

export function SelectingCourier() {
  const frame = useCurrentFrame();

  const isDropdownVisible =
    frame >= DROPDOWN_OPEN_START && frame < FINAL_STATE_START;
  const buttonDisabled = frame < FINAL_STATE_START;
  const selectedCourier =
    frame >= FINAL_STATE_START
      ? `${demoData.courierName} - ${demoData.courierPhone}`
      : null;

  // Zoom held en 1.08, origen estable en el form.
  const zoom = 1.08;

  return (
    <CalculatorFrame
      address={demoData.fullAddress}
      showAddressCursor={false}
      showClearButton={true}
      selectedCourier={selectedCourier}
      dropdownOpen={isDropdownVisible}
      dropdownHighlightIndex={
        frame >= HIGHLIGHT_START && frame < DROPDOWN_CLOSE_START ? 0 : -1
      }
      buttonDisabled={buttonDisabled}
      showResults={false}
      routeProgress={0}
      searchFocused={false}
      courierFocused={true}
      zoom={zoom}
      zoomOriginX="8%"
      zoomOriginY="30%"
    />
  );
}