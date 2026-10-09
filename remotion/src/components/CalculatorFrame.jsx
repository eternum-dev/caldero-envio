// CalculatorFrame — el shell visual compartido por todas las escenas.
// Replica la UI del calculator real (App.jsx) usando los tokens del design system.
// Tamaños/paddings/border radius sincronizados con tailwind.config.js del main.

import { Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { tokens, demoData } from '../data';
import { MapRouteAnimation } from './MapRouteAnimation';
import { PriceTagBlock } from './PriceTagBlock';

const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const HEADER_HEIGHT = 72;
const CONTENT_PADDING = 48;

// Iconos inline (copiados del Icon atom del proyecto)
const IconHome = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const IconSettings = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93l.8.357c.41.183.7.602.67 1.05l-.118.91c-.05.394.21.764.59.86l.86.221c.46.118.78.572.64 1.03l-.298.864c-.14.402-.482.673-.9.673h-.86c-.418 0-.76.272-.86.673l-.299.864c-.139.458.18.912.64 1.03l.86.221c.38.097.64.467.59.86l-.118.91c-.03.448.26.867.67 1.05l.8.357c.396.166.71.506.78.93l.149.894c.09.542.56.94 1.11.94h1.094c.55 0 1.02-.398 1.11-.94l.149-.894c.07-.424.384-.764.78-.93l.8-.357c.41-.183.7-.602.67-1.05l-.118-.91c-.05-.393.21-.763.59-.86l.86-.221c.46-.118.78-.572.64-1.03l-.298-.864c-.14-.401-.482-.673-.9-.673h-.86c-.418 0-.76-.272-.86-.673l-.299-.864c-.139-.458.18-.912.64-1.03l.86-.221c.38-.097.64-.466.59-.86l-.118-.91c-.03-.448.26-.867.67-1.05l.8-.357c.396-.166.71-.506.78-.93l.149-.894c.09-.542.56-.94 1.11-.94z"
    />
  </svg>
);

const IconUser = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const IconChevronDown = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function CalculatorFrame({
  // Header (autenticado)
  calderos = demoData.initialCalderos,
  // Estado del form
  address = '',
  showAddressCursor = false,
  cursorOpacity = 0.95,
  showClearButton = false,
  autocompleteOpen = false,
  autocompleteHighlightIndex = -1,
  selectedCourier = null,
  dropdownOpen = false,
  dropdownHighlightIndex = -1,
  // Focus/hover state (cambia el background a #f5af4614)
  searchFocused = false,
  courierFocused = false,
  buttonPressed = false,
  buttonLoading = false,
  buttonDisabled = true,
  // Estado del resultado
  showResults = false,
  resultAppearing = false,
  routeProgress = 0,
  priceScale = 1,
  // Estado visual
  fadeOut = 0,
  whiteFlash = 0,
  // Zoom (1.0 = sin zoom, > 1 = zoom in hacia zoomOrigin, < 1 = zoom out)
  zoom = 1,
  zoomOriginX = '50%',
  zoomOriginY = '50%',
  // Click pulse effect (ripple animado en el punto del click)
  clickPulse = null, // { x, y, startFrame, durationFrames, color }
}) {
  // Botón "Calcular Envío" — colores sincronizados con Button.jsx (primary variant)
  // bg-btn-primary (#c8893a) con text-[#1a0f00] (dark brown)
  // Disabled: opacity-50 sobre los mismos colores
  const buttonBg = tokens.goldDim; // #c8893a (darker gold, brass)
  const buttonText = '#1a0f00'; // dark brown, no negro puro
  const buttonStyle = buttonDisabled ? { opacity: 0.5 } : {};

  return (
    <div
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        backgroundColor: tokens.bgPageWarm,
        opacity: 1 - fadeOut,
        position: 'relative',
        fontFamily: tokens.fontSans,
        // Best practice Remotion: usar la propiedad CSS `scale` separada de `transform`
        scale: String(zoom),
        transformOrigin: `${zoomOriginX} ${zoomOriginY}`,
      }}
    >
      {/* Header autenticado */}
      <div
        style={{
          height: HEADER_HEIGHT,
          padding: `0 ${CONTENT_PADDING}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${tokens.borderGold}`,
        }}
      >
        {/* Mascot + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 175, 70, 0.20)',
              border: `1px solid rgba(245, 175, 70, 0.35)`,
              padding: 4,
            }}
          >
            <Img
              src={staticFile('mascot.svg')}
              alt="Caldero Envío"
              style={{ width: 28, height: 28 }}
            />
          </span>
          <span
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 20,
              color: tokens.gold,
            }}
          >
            Caldero Envío
          </span>
        </div>

        {/* Derecha: credit badge + iconos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 500,
              color: tokens.ink,
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.borderGold}`,
              borderRadius: tokens.radiusFull,
              padding: '6px 12px',
            }}
          >
            <span aria-hidden="true">🪙</span>
            <span>{calderos}</span>
            <span style={{ color: tokens.muted }}>calderos</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', color: tokens.muted, padding: 6 }}>
            <IconHome size={20} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: tokens.muted, padding: 6 }}>
            <IconSettings size={20} />
            <IconChevronDown size={12} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: tokens.muted, padding: 6 }}>
            <IconUser size={16} />
            <IconChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          padding: CONTENT_PADDING,
          paddingTop: 40,
          gap: 40,
          height: FRAME_HEIGHT - HEADER_HEIGHT,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Click pulse overlay (ripple animado) — siempre montado, retorna null si no hay pulse */}
        <ClickPulse pulse={clickPulse} />
        {/* Columna izquierda: form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            paddingRight: 24,
            borderRight: `1px solid ${tokens.borderGold}`,
          }}
        >
          <h1
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 32,
              fontWeight: 600,
              color: tokens.ink,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Calcular Envío
          </h1>

          {/* Dirección de destino */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: tokens.muted,
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Dirección de destino
            </label>
            <div
              style={{
                position: 'relative',
                // Hover/focus: tinte gold (#f5af4614) en lugar de surface2
                backgroundColor: searchFocused ? tokens.surfaceTint : tokens.surface2,
                border: `1px solid ${searchFocused ? tokens.borderGoldStrong : tokens.borderGold}`,
                borderRadius: tokens.radiusSm,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 40,
                fontSize: 14,
              }}
            >
              <span style={{ color: tokens.goldDim, display: 'flex' }}>
                <IconSearch size={16} />
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: tokens.ink }}>{address}</span>
                {showAddressCursor && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 1.5,
                      height: 16,
                      backgroundColor: tokens.gold,
                      marginLeft: 2,
                      opacity: cursorOpacity,
                    }}
                  />
                )}
                {!address && !showAddressCursor && (
                  <span style={{ fontSize: 14, color: tokens.muted }}>Ingresá la dirección...</span>
                )}
              </div>
              {showClearButton && (
                <span style={{ color: tokens.muted, display: 'flex', cursor: 'pointer' }}>
                  <IconX size={14} />
                </span>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {autocompleteOpen && (
              <ul
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  backgroundColor: tokens.surfaceLow,
                  border: `1px solid ${tokens.borderGold}`,
                  borderRadius: tokens.radiusSm,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 10,
                }}
              >
                {demoData.addressSuggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      color: idx === autocompleteHighlightIndex ? tokens.bg : tokens.ink,
                      backgroundColor:
                        idx === autocompleteHighlightIndex ? tokens.gold : 'transparent',
                      fontWeight: idx === autocompleteHighlightIndex ? 600 : 400,
                      borderBottom:
                        idx < demoData.addressSuggestions.length - 1
                          ? `1px solid ${tokens.borderGold}`
                          : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Repartidor */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: tokens.muted,
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Repartidor
            </label>
            <div
              style={{
                position: 'relative',
                // Hover/focus: tinte gold (#f5af4614) en lugar de surface2
                backgroundColor: courierFocused ? tokens.surfaceTint : tokens.surface2,
                border: `1px solid ${courierFocused ? tokens.borderGoldStrong : tokens.borderGold}`,
                borderRadius: tokens.radiusSm,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 40,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 14, color: selectedCourier ? tokens.ink : tokens.muted }}>
                {selectedCourier || 'Seleccionar repartidor'}
              </span>
              <span style={{ color: tokens.muted, display: 'flex' }}>
                <IconChevronDown size={14} />
              </span>

              {/* Dropdown abierto */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    backgroundColor: tokens.surfaceLow,
                    border: `1px solid ${tokens.borderGoldStrong}`,
                    borderRadius: tokens.radiusSm,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 10,
                  }}
                >
                  {[
                    { name: 'Matias Jara', phone: '+56 9 1234 5678' },
                    { name: 'Camila Soto', phone: '+56 9 8765 4321' },
                    { name: 'Diego Vargas', phone: '+56 9 5555 1234' },
                  ].map((c, idx) => (
                    <div
                      key={c.name}
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        color: idx === dropdownHighlightIndex ? tokens.bg : tokens.ink,
                        backgroundColor:
                          idx === dropdownHighlightIndex ? tokens.gold : 'transparent',
                        fontWeight: idx === dropdownHighlightIndex ? 600 : 400,
                        borderBottom: idx < 2 ? `1px solid ${tokens.borderGold}` : 'none',
                      }}
                    >
                      {c.name} - {c.phone}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botón Calcular */}
          <button
            type="button"
            disabled={buttonDisabled}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: buttonBg,
              color: buttonText,
              border: 'none',
              borderRadius: tokens.radiusSm,
              fontSize: 14,
              fontWeight: 500,
              cursor: buttonDisabled ? 'not-allowed' : 'pointer',
              fontFamily: tokens.fontSans,
              // Escala instantánea controlada por prop (no CSS transition — no trackea frame numbers)
              scale: buttonPressed ? '0.98' : '1',
              ...buttonStyle,
            }}
          >
            {buttonLoading ? 'Calculando...' : 'Calcular Envío'}
          </button>

          {/* Resultado (visible solo en escena final) */}
          {showResults && (
            <div
              style={{
                marginTop: 4,
                opacity: resultAppearing ? 1 : 0,
                translate: `0 ${resultAppearing ? 0 : 16}px`,
                scale: String(priceScale),
                // Sin CSS transition — el cambio se hace con interpolate frame-based
                // en las escenas (ver Reset.jsx y Calculating.jsx)
              }}
            >
              <PriceTagBlock />
            </div>
          )}

          {/* Empty state */}
          {!showResults && (
            <div
              style={{
                marginTop: 8,
                padding: '20px 16px',
                border: `1px dashed ${tokens.borderGold}`,
                borderRadius: tokens.radiusSm,
                textAlign: 'center',
                color: tokens.muted,
                fontSize: 13,
              }}
            >
              Completá los datos y calculá un envío para ver los resultados aquí
            </div>
          )}
        </div>

        {/* Columna derecha: mapa */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingLeft: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2
              style={{
                fontFamily: tokens.fontDisplay,
                fontSize: 26,
                fontWeight: 600,
                color: tokens.ink,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Ruta
            </h2>
            <span
              style={{
                backgroundColor: tokens.goldBg,
                border: `1px solid ${tokens.borderGoldFill}`,
                color: tokens.goldDim,
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: tokens.radiusFull,
                fontWeight: 500,
              }}
            >
              Valdivia
            </span>
          </div>

          <div
            style={{
              flex: 1,
              border: `1px solid ${tokens.borderGold}`,
              borderRadius: tokens.radiusMd,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: tokens.surfaceLow,
            }}
          >
            <MapRouteAnimation progress={routeProgress} />
          </div>
        </div>
      </div>

      {/* White flash overlay (para el reload transition) */}
      {whiteFlash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: whiteFlash,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

// ClickPulse — ripple animado en el punto del click. Tamaño de un puntero normal
// (~20px inicial) con un crecimiento sutil (1 → 1.8x). Se monta siempre
// (porque Remotion requiere hooks no-condicionales), pero retorna null
// cuando no hay pulse activo.
function ClickPulse({ pulse }) {
  const frame = useCurrentFrame();
  if (!pulse) return null;
  const { x, y, startFrame, durationFrames = 18, color = '#ffffff' } = pulse;
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > durationFrames) return null;
  const progress = localFrame / durationFrames;
  // Crecimiento sutil: 1 → 1.8x. Fade out: 0.6 → 0
  const scale = interpolate(progress, [0, 1], [1, 1.8], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(progress, [0, 1], [0.6, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 12, // centrado (width 24 → 12 cada lado)
        top: y - 12,
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: color,
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
}