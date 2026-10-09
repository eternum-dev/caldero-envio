# Video demo de la calculadora con Remotion

**Feature**: video MP4 programático (Remotion) del flujo principal de la calculadora, para colocar en el slot `<VideoPlayer>` de la home.
**Branch**: `feature/video-demo-remotion`
**Servicio acumulado prev**: 0
**TDD**: N/A — assets gráficos/video, no aplica testing unitario tradicional

---

## 🎯 Objetivo

1. **Generar un MP4 de ~22s** que muestra el flujo principal: calculadora vacía → tipeo de dirección → selección de repartidor → click en "Calcular Envío" → transición/refresh → resultado con precio + distancia + mapa con ruta animada.
2. **Mantener consistencia visual** con el design system actual (paleta gold/ink/surface, tipografía, formas).
3. **Output reproducible** que se pueda regenerar cuando cambie la UI sin tener que re-grabar pantalla.

---

## 🟥 Restricciones críticas

- **No introducir TypeScript** — el repo principal es JSX. Remotion project será JSX puro.
- **No compartir `node_modules`** con el proyecto principal — `/remotion` tiene su propio `package.json`. Evita inflar el bundle principal.
- **No contaminar el build principal de Vite** — los archivos de Remotion viven en `/remotion/`, fuera de `src/`.
- **El output debe ser chico** (< 5 MB idealmente) para no afectar el LCP de la home.
- **No incluir credenciales** (`functions/serviceAccount.json`, etc.) en commits. El stash los tiene guardados en la rama anterior; no se incluyen en esta.
- **El video es mudo** — el `<VideoPlayer>` actual usa `muted autoplay loop` por default.

---

## 📐 Arquitectura propuesta

```
remotion/
├── package.json                    # Dependencias Remotion 4.x + React 18
├── remotion.config.js              # Config del bundler (webpack)
├── src/
│   ├── index.js                    # Entry point: registerRoot(RemotionRoot)
│   ├── Root.jsx                    # Registra compositions
│   ├── DemoCalculadora.jsx         # Composición principal: secuencia las 5 escenas
│   ├── data.js                     # Constantes (dirección, courier, precio, coords, ruta SVG)
│   ├── components/
│   │   ├── CalculatorFrame.jsx     # Frame estático (header, layout 2 columnas, form, mapa)
│   │   ├── MapRouteAnimation.jsx   # SVG con ruta animada (polyline + marcadores origen/destino)
│   │   └── PriceTagBlock.jsx       # Bloque grande de resultado (precio + distancia + tiempo)
│   └── scenes/
│       ├── EmptyCalculator.jsx     # Estado inicial: form vacío + mapa sin ruta
│       ├── TypingAddress.jsx       # Texto "Ruben Dario 146" se escribe letra por letra
│       ├── SelectingCourier.jsx    # Dropdown abre + "Matias Jara" se selecciona
│       ├── ClickingCalculate.jsx   # Botón "Calcular Envío" se presiona + breve flash
│       ├── ReloadTransition.jsx    # Fade wipe como si la página refrescara
│       └── ResultWithRoute.jsx     # Aparece precio + distancia + ruta animada
public/
└── videos/
    └── demo-calculadora.mp4        # Render output, ~22s, ~3-5 MB
src/pages/Landing.jsx               # Cambio en <VideoPlayer src="..." />
```

---

## 📋 Task list

### Fase 1 — Setup + escena 1 (este turno)

| # | Task | Archivo | Effort | Commit |
|---|------|---------|--------|--------|
| T1 | Crear este feature doc | `odd/tasks/video-demo-remotion.md` | 5 min | docs |
| T2 | Setup `/remotion` con package.json + config + entry point | `remotion/package.json`, `remotion.config.js`, `remotion/src/index.js`, `remotion/src/Root.jsx` | 30 min | chore(remotion) |
| T3 | Constantes demo (Chile/Valdivia, Ruben Dario 146, Matias Jara, $2.500, 4.2 km, 18 min) | `remotion/src/data.js` | 10 min | feat(remotion) |
| T4 | `CalculatorFrame` — UI estática compartida entre escenas (header, form vacío, mapa vacío) | `remotion/src/components/CalculatorFrame.jsx` | 45 min | feat(remotion) |
| T5 | `EmptyCalculator` — escena 1 (form tal como se ve al cargar la home) | `remotion/src/scenes/EmptyCalculator.jsx` | 20 min | feat(remotion) |
| T6 | `DemoCalculadora` — composición raíz con `<Sequence>` para escena 1 | `remotion/src/DemoCalculadora.jsx` | 15 min | feat(remotion) |
| T7 | Verificar que `npm run dev` en `/remotion` levanta Studio y se ve la escena 1 | — | 10 min | — |

**Effort Fase 1**: ~2.5 h (estimado, primera vuelta)

### Fase 2 — Escenas 2-5 + secuencia completa (siguiente turno, después de feedback)

| # | Task | Effort |
|---|------|--------|
| T8 | `TypingAddress` — animación de typing en input de dirección | 30 min |
| T9 | `SelectingCourier` — dropdown animado + selección Matias Jara | 30 min |
| T10 | `ClickingCalculate` — press feedback + flash + spinner breve | 20 min |
| T11 | `ReloadTransition` — fade wipe estilo "browser refresh" | 15 min |
| T12 | `MapRouteAnimation` — SVG con calles sugeridas + polyline animada | 60 min |
| T13 | `PriceTagBlock` — bloque de resultado grande (precio, distancia, tiempo) | 30 min |
| T14 | `ResultWithRoute` — orquesta aparición del resultado + animación de ruta | 30 min |
| T15 | `DemoCalculadora` — secuencia completa con timing de las 5 escenas | 30 min |

### Fase 3 — Render + integración en la home

| # | Task | Effort |
|---|------|--------|
| T16 | Renderizar MP4 (`npx remotion render DemoCalculadora out/demo-calculadora.mp4`) | 5 min (+ tiempo de render) |
| T17 | Mover MP4 a `public/videos/demo-calculadora.mp4` y optimizar tamaño si hace falta | 10 min |
| T18 | Actualizar `src/pages/Landing.jsx` con `<VideoPlayer src="/videos/demo-calculadora.mp4" />` | 5 min |
| T19 | Verificar build + lint en main project | 10 min |
| T20 | Commit work-unit del feature completo | 5 min |

---

## 📦 Dependencias nuevas (en `/remotion/package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "remotion": "^4.0.0",
    "@remotion/cli": "^4.0.0"
  },
  "devDependencies": {
    "@remotion/bundler": "^4.0.0"
  }
}
```

Sin TypeScript. Sin styled-components (inline styles para mantener consistencia con tokens del proyecto).

---

## 🎨 Datos demo (confirmados por el usuario 2026-10-08)

- **País/ciudad**: Chile, Valdivia
- **Dirección**: Ruben Dario 146
- **Repartidor**: Matias Jara
- **Vehículo**: auto (no se muestra en esta calculadora)
- **Distancia**: 4.2 km
- **Tiempo**: 18 min
- **Precio**: $2.500

---

## 🎬 Timing tentativo (30fps)

| Escena | Frames | Segundos |
|--------|--------|----------|
| EmptyCalculator (idle con CTA parpadeante) | 0-90 | 0-3s |
| TypingAddress | 90-210 | 3-7s |
| SelectingCourier | 210-300 | 7-10s |
| ClickingCalculate | 300-360 | 10-12s |
| ReloadTransition | 360-420 | 12-14s |
| ResultWithRoute (precio + distancia + ruta) | 420-660 | 14-22s |
| **Total** | **660** | **22s** |

---

## ✅ Criterios de aceptación

- [ ] `npm run dev` en `/remotion` levanta Remotion Studio en puerto 3000 sin errores
- [ ] La escena 1 muestra la UI con tokens de color correctos (gold/ink/surface)
- [ ] El MP4 renderizado tiene duración ~22s, 16:9, < 5 MB
- [ ] El MP4 se reproduce correctamente en `<VideoPlayer>` de `Landing.jsx`
- [ ] Lint + build del proyecto principal siguen pasando
- [ ] No hay credenciales ni archivos sensibles en commits

---

## 📚 Referencias

- Remotion docs: https://www.remotion.dev/docs
- Migración a Remotion 4: https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/4-0-migration.mdx
- Slot actual del VideoPlayer: `src/pages/Landing.jsx` líneas 103-118
- VideoPlayer atom: `src/ui/atoms/VideoPlayer.jsx`
- App.jsx (flujo a replicar): `src/pages/App.jsx`
- Tokens de diseño: `tailwind.config.js` (colores gold, ink, surface)

---

## 🔄 Estado

- [x] **Fase 1**: setup + escena 1 ← *en curso*
- [ ] **Fase 2**: escenas 2-5
- [ ] **Fase 3**: render + integración