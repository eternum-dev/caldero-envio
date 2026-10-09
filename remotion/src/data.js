// Design tokens del proyecto Caldero Envío — sincronizados con
// `tailwind.config.js` del proyecto principal. Si esos tokens cambian, hay
// que actualizar este archivo.

export const tokens = {
  // Backgrounds (de tailwind.config.js)
  bg: '#141210',
  bgPageWarm: '#1a1714',
  surface: '#1e1a16',
  surfaceLow: '#23201c',
  surface2: '#27211a',
  // Focus/hover state — surface2 con tinte gold (mismo que `bg-surface-tint` del main)
  surfaceTint: 'rgba(245, 175, 70, 0.08)', // #f5af4614
  // Borders
  borderGold: 'rgba(245, 175, 70, 0.18)',
  borderGoldStrong: 'rgba(245, 175, 70, 0.35)',
  borderGoldFill: 'rgba(245, 175, 70, 0.25)',
  // Brand
  gold: '#F5AF46',
  goldDim: '#c8893a',
  goldBright: '#f5c374',
  goldBg: 'rgba(245, 175, 70, 0.08)',
  // WhatsApp brand (color del botón de enviar)
  whatsappGreen: '#25D366',
  whatsappGreenHover: '#20bd5a',
  // Text
  ink: '#f0e8dc',
  muted: '#9a8878',
  danger: '#c0392b',
  // Border radius (de tailwind.config.js: borderRadius.sm = 8px)
  radiusSm: 8,
  radiusMd: 14,
  radiusFull: 9999,
  // Typography (fontes de Google Fonts — cargadas en /remotion/src/fonts.css)
  fontDisplay: '"Fraunces", Georgia, serif',
  fontSans: '"DM Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const demoData = {
  // País y ciudad para el badge del header del mapa
  country: 'Chile',
  city: 'Valdivia',
  // Repartidor
  courierName: 'Matias Jara',
  courierPhone: '+56 9 1234 5678',
  // Dirección tipeada (versión corta y completa como la muestra la web)
  addressShort: 'Ruben Dario 146',
  // Parcial: lo que se tipea antes de que aparezca el autocomplete
  addressPartial: 'Ruben Dario',
  // Direcciones sugeridas en el autocomplete (simulación del dropdown real)
  // La primera es la que "selecciona" el usuario
  addressSuggestions: [
    'Ruben Dario 146, Valdivia, Los Ríos 5090000, Chile',
    'Ruben Dario 250, Valdivia, Los Ríos 5090000, Chile',
    'Ruben Dario 850, Valdivia, Los Ríos 5090000, Chile',
  ],
  fullAddress: 'Ruben Dario 146, Valdivia, Los Ríos 5090000, Chile',
  // Resultado
  distance: '4.2 km',
  oneWayTime: '18 min', // tiempo de ida
  totalTime: '46 min', // 18 + 18 + 10 buffer (ida + vuelta + 10min)
  price: '$2.500',
  // Calderos (header) — empieza en 199, baja a 198 después de calcular
  initialCalderos: 199,
  postCalculateCalderos: 198,
};

// Coords aproximadas para la polyline del mapa SVG (Valdivia centro).
// Sistema de coordenadas interno del SVG: viewBox 0 0 600 400.
// Origen (local) abajo-izquierda, destino arriba-derecha — recrea el efecto
// "delivery sale del local hacia el cliente".
// NOTA: actualmente no se usa — el mapa se compone con PNGs reales. Se
// conserva por si en el futuro se quiere animar la ruta en SVG.
export const mapGeometry = {
  viewBox: '0 0 600 400',
  origin: { x: 100, y: 320 },
  destination: { x: 480, y: 90 },
  streets: [
    'M 0 100 L 600 100',
    'M 0 200 L 600 200',
    'M 0 300 L 600 300',
    'M 150 0 L 150 400',
    'M 300 0 L 300 400',
    'M 450 0 L 450 400',
    'M 0 50 L 600 50',
    'M 0 150 L 600 150',
    'M 0 250 L 600 250',
    'M 0 350 L 600 350',
    'M 75 0 L 75 400',
    'M 225 0 L 225 400',
    'M 375 0 L 375 400',
    'M 525 0 L 525 400',
  ],
  routePath:
    'M 100 320 Q 200 320 220 250 T 350 180 Q 420 130 480 90',
};

// Timing de la composición (frames a 30fps)
export const timing = {
  fps: 30,
  // Cada escena tiene un frame de inicio. La composición suma a esto.
  scene1Empty: { start: 0, duration: 45 }, // 0-1.5s: calculadora vacía
  scene2Typing: { start: 45, duration: 90 }, // 1.5-4.5s: typing dirección parcial
  scene3Autocomplete: { start: 135, duration: 60 }, // 4.5-6.5s: autocomplete dropdown
  scene4Courier: { start: 195, duration: 90 }, // 6.5-9.5s: courier dropdown
  scene5Calculate: { start: 285, duration: 30 }, // 9.5-10.5s: click + brief press
  scene6Calculating: { start: 315, duration: 30 }, // 10.5-11.5s: "Calculando..." moment
  scene7Result: { start: 345, duration: 120 }, // 11.5-15.5s: result (2s ruta + 2s hold)
  scene8Reset: { start: 465, duration: 30 }, // 15.5-16.5s: click "Nueva búsqueda" → empty
};

export const totalDurationInFrames =
  timing.scene1Empty.duration +
  timing.scene2Typing.duration +
  timing.scene3Autocomplete.duration +
  timing.scene4Courier.duration +
  timing.scene5Calculate.duration +
  timing.scene6Calculating.duration +
  timing.scene7Result.duration +
  timing.scene8Reset.duration;