// Scene 3: AutocompleteSelect — dropdown aparece y se selecciona la primera opción.
// Zoom held en 1.04 (input area).

import { useCurrentFrame } from 'remotion';
import { CalculatorFrame } from '../components/CalculatorFrame';
import { demoData } from '../data';

const DROPDOWN_OPEN_START = 10;
const HIGHLIGHT_START = 20;
const FINAL_STATE_START = 50;

export function AutocompleteSelect() {
  const frame = useCurrentFrame();

  const isDropdownVisible =
    frame >= DROPDOWN_OPEN_START && frame < FINAL_STATE_START;
  const isHighlighted = frame >= HIGHLIGHT_START && frame < FINAL_STATE_START;

  const showFullAddress = frame >= FINAL_STATE_START;
  const address = showFullAddress ? demoData.fullAddress : demoData.addressPartial;

  return (
    <CalculatorFrame
      address={address}
      showAddressCursor={false}
      showClearButton={true}
      autocompleteOpen={isDropdownVisible}
      autocompleteHighlightIndex={isHighlighted ? 0 : -1}
      selectedCourier={null}
      dropdownOpen={false}
      buttonDisabled={true}
      showResults={false}
      routeProgress={0}
      searchFocused={true}
      courierFocused={false}
      zoom={1.08}
      zoomOriginX="8%"
      zoomOriginY="30%"
    />
  );
}