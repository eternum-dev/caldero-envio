// PriceTagBlock — replica la estructura del resultado en App.jsx:
//   1. PriceTag (card grande con el precio)
//   2. DistanceInfo (3 cards separadas: Distancia, Tiempo de ida, Tiempo total)
//   3. ActionButtons (WhatsApp verde + print + Nueva búsqueda)
//
// Estructura y tamaños sincronizados con PriceTag.jsx + DistanceInfo.jsx +
// ActionButtons.jsx del proyecto principal.

import { tokens, demoData } from '../data';

const IconWhatsApp = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const IconPrinter = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);

const IconLocation = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export function PriceTagBlock() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* PriceTag (card grande) */}
      <div
        style={{
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.borderGold}`,
          borderRadius: tokens.radiusMd,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: tokens.muted,
            margin: 0,
            fontWeight: 500,
            fontFamily: tokens.fontSans,
          }}
        >
          Precio del envío
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 4,
            fontFamily: tokens.fontDisplay,
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: tokens.goldDim,
              fontWeight: 600,
            }}
          >
            $
          </span>
          <span
            style={{
              fontSize: 56,
              color: tokens.gold,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            2.500
          </span>
        </div>
      </div>

      {/* DistanceInfo (3 cards separadas) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        {[
          { label: 'Distancia', value: demoData.distance, icon: <IconLocation size={16} /> },
          { label: 'Tiempo de ida', value: demoData.oneWayTime, icon: <IconClock size={16} /> },
          { label: 'Tiempo total', value: demoData.totalTime, icon: <IconClock size={16} /> },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.borderGold}`,
              borderRadius: tokens.radiusSm,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textAlign: 'center',
              color: tokens.gold,
            }}
          >
            {card.icon}
            <span
              style={{
                fontSize: 11,
                color: tokens.muted,
                fontFamily: tokens.fontSans,
                fontWeight: 500,
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontSize: 13,
                color: tokens.ink,
                fontFamily: tokens.fontSans,
                fontWeight: 600,
              }}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* ActionButtons: WhatsApp verde + print + Nueva búsqueda */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 4,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              // Versión actual del web: bg-surface-2 (NO verde) con icono/texto blanco
              backgroundColor: tokens.surface2,
              color: '#ffffff',
              border: `1px solid ${tokens.borderGold}`,
              borderRadius: tokens.radiusSm,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: tokens.fontSans,
            }}
          >
            <IconWhatsApp size={18} />
            <span>Enviar WhatsApp</span>
          </button>
          <button
            type="button"
            style={{
              width: 42,
              height: 42,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.surface2,
              color: tokens.goldDim,
              border: `1px solid ${tokens.borderGold}`,
              borderRadius: tokens.radiusSm,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <IconPrinter size={16} />
          </button>
        </div>
        <button
          type="button"
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            color: tokens.muted,
            border: `1px solid ${tokens.borderGold}`,
            borderRadius: tokens.radiusSm,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: tokens.fontSans,
          }}
        >
          Nueva búsqueda
        </button>
      </div>
    </div>
  );
}