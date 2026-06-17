# Caldero Envío — Design System v3

## Stack de referencia
- React 18 + Vite
- Tailwind CSS (tokens en `tailwind.config.js`)
- Fuentes: Fraunces (display) + DM Sans (body) via Google Fonts
- Atomic Design: atoms → molecules → organisms → templates → pages
- Mapas: Mapbox GL JS (dark-v11 con tema de marca)

---

## 1. Tokens de color

### Paleta base
| Token Tailwind        | Valor hex / rgba                | Uso                                           |
|-----------------------|---------------------------------|-----------------------------------------------|
| `bg-bg`               | `#141210`                       | Fondo de página                               |
| `bg-surface`          | `#1e1a16`                       | Cards, panels, modales                        |
| `bg-surface-2`        | `#27211a`                       | Inputs, items anidados, filas de lista        |
| `bg-surface-tint`     | `rgba(245,175,70,0.08)`         | Hover sutil sobre surface                     |
| `bg-gold-bg`          | `rgba(245,175,70,0.08)`         | Fondo de íconos, badges, tags                 |
| `bg-btn-primary`      | `#c8893a`                       | Botón CTA principal                           |

### Gold (texto, bordes con modificador de opacidad)
| Clase Tailwind        | Resuelve a                      | Uso                                           |
|-----------------------|---------------------------------|-----------------------------------------------|
| `text-gold`           | `#F5AF46`                       | Íconos activos, precio, links, tabs activos   |
| `text-gold-dim`       | `#c8893a`                       | Botón CTA, hover states, labels destacados    |
| `border-gold`         | `#F5AF46` (opacidad completa)   | Step indicator activo/completado              |
| `border-gold/18`      | `rgba(245,175,70,0.18)`         | Borde estándar de cards e inputs              |
| `border-gold/25`      | `rgba(245,175,70,0.25)`         | Borde de badges, íconos decorativos           |
| `border-gold/35`      | `rgba(245,175,70,0.35)`         | Borde de elementos activos / focused          |
| `bg-gold`             | `#F5AF46`                       | Fondo sólido (step completado)                |

### Neutros
| Token                 | Valor hex                       | Uso                                           |
|-----------------------|---------------------------------|-----------------------------------------------|
| `text-ink`            | `#f0e8dc`                       | Texto principal                               |
| `text-muted`          | `#9a8878`                       | Labels, placeholders, metadata                |
| `text-danger`         | `#c0392b`                       | Errores de validación                         |

### Opacidades personalizadas
Para que `border-gold/18` funcione, se agregó al `tailwind.config.js`:
```js
opacity: { '18': '0.18' }
```
Esto permite usar `/18`, `/25`, `/35` como modificadores de opacidad en cualquier color.

> ⚠️ Los tokens de color usan estructura plana (`gold: { DEFAULT, dim }`), NO anidada (`text: { gold }`, `border: { gold }`). Esto asegura que `text-gold`, `border-gold`, `bg-gold` resuelvan correctamente.

---

## 2. Tipografía

### Familias
```
font-display → Fraunces (serif, italic disponible)
font-sans    → DM Sans
```

### Escala de uso
| Elemento                        | Clases Tailwind                                             |
|---------------------------------|-------------------------------------------------------------|
| Nombre de marca / logo          | `font-display text-xl text-gold`                            |
| Títulos de sección (h2)         | `font-display text-display-sm font-semibold text-ink`       |
| Títulos de página (h1)          | `font-display text-display-lg font-semibold text-ink`       |
| Precio destacado                | `font-display text-price font-semibold text-gold`           |
| Cuerpo / párrafos               | `font-sans text-sm text-ink`                                |
| Labels de formulario            | `font-sans text-label uppercase tracking-widest text-muted` |
| Texto secundario / metadata     | `font-sans text-xs text-muted`                              |
| Links de acción                 | `font-sans text-xs text-gold-dim underline underline-offset-2` |

### Regla clave
> `font-display` solo para: logo, títulos de sección, precio y headings de cards.
> Todo lo demás usa `font-sans`.

---

## 3. Atomic Design — instrucciones por nivel

### Principio general
Cada nivel solo conoce a los niveles inferiores. Un átomo no importa moléculas.
Los estilos visuales viven en los átomos — los niveles superiores solo componen y espacian.

---

### ATOMS — `src/ui/atoms/`

Son los únicos componentes que definen estilos base. Cada átomo debe:
- Aceptar `className` como prop para extensión puntual
- Nunca tener margin propio — el espaciado lo define el padre
- Usar exclusivamente tokens del design system

#### Button.jsx
```jsx
// variantes: 'primary' | 'secondary' | 'ghost' | 'danger'
const variants = {
  primary:   'bg-btn-primary text-[#1a0f00] hover:opacity-90',
  secondary: 'bg-surface-2 border border-gold/18 text-gold-dim hover:bg-surface-tint',
  ghost:     'bg-transparent text-muted hover:text-ink',
  danger:    'bg-transparent text-danger hover:opacity-80',
}
// base siempre: font-sans font-medium text-sm rounded-sm py-2.5 px-4 transition-all
```

#### Input.jsx
```jsx
// base: w-full bg-surface-2 border border-gold/18 rounded-sm
//       px-3.5 py-2.5 text-sm text-ink placeholder:text-muted
//       focus:outline-none focus:border-gold/35 transition-colors
```

#### Label.jsx
```jsx
// base: block font-sans text-label uppercase tracking-widest text-muted mb-1.5
// asterisco requerido: <span className="text-gold-dim ml-0.5">*</span>
```

#### Badge.jsx
```jsx
// base: bg-gold-bg border border-gold/25 text-gold-dim
//       text-[10px] px-2 py-0.5 rounded-full font-sans
```

#### Price.jsx
```jsx
// Muestra el precio con animación de entrada
// base: flex items-baseline justify-center gap-1 animate-price-in
// símbolo: font-display text-[22px] text-gold-dim
// valor:   font-display text-price font-semibold text-gold leading-none
```

#### Icon.jsx
```jsx
// Wrapper de Tabler Icons
// tamaño default: 16px, color default: currentColor
// uso: <Icon name="map-pin" size={18} className="text-gold" />
```

#### Spinner.jsx
```jsx
// base: animate-spin rounded-full border-2 border-gold/20 border-t-gold
// tamaños: sm (16px), md (24px), lg (32px)
```

---

### MOLECULES — `src/ui/molecules/`

Combinan átomos para formar unidades funcionales. No deben tener lógica de negocio.

#### FormField.jsx
```jsx
// Composición: Label + Input + mensaje de error opcional
// estructura:
<div className="flex flex-col gap-0">
  <Label />
  <Input />
  {error && <span className="text-[11px] text-danger mt-1">{error}</span>}
</div>
```

#### FeatureCard.jsx ✨
```jsx
// Card de beneficio para Landing (ícono + título + descripción)
// props: icon, title, description
// estructura:
<div className="bg-surface border border-gold/18 rounded-[14px] p-6 flex flex-col gap-4">
  <div className="w-12 h-12 bg-gold-bg border border-gold/25 rounded-full flex items-center justify-center">
    <Icon name={icon} className="w-6 h-6 text-gold" />
  </div>
  <h3 className="font-display text-display-sm font-semibold text-ink">{title}</h3>
  <p className="font-sans text-sm text-muted">{description}</p>
</div>
```

#### ActionButtons.jsx
```jsx
// Fila de acciones post-cálculo: WhatsApp + imprimir
// estructura: flex gap-2
// btn WhatsApp: Button variant="secondary" con ícono verde + texto
// btn imprimir: Button variant="secondary" solo ícono, width fijo w-[42px]
```

#### DistanceInfo.jsx
```jsx
// Grid de 3 stat boxes: distancia / tiempo ida / tiempo total
// estructura: grid grid-cols-3 gap-2
// cada stat: bg-surface-2 border border-gold/18 rounded-sm p-2.5
//            flex flex-col items-center gap-1 text-center
```

#### CourierSelect.jsx
```jsx
// Selector de repartidor con badge de estado
// estructura: bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5
//             flex items-center justify-between
// izquierda: ícono moped + nombre + teléfono
// derecha: Badge "En línea" + chevron
```

#### SearchBox.jsx
```jsx
// Input con ícono de búsqueda a la izquierda y botón clear
// estructura: bg-surface-2 border border-gold/18 rounded-sm
//             flex items-center gap-2 px-3.5 py-2.5
// ícono: Icon "search" text-gold
// clear btn: Icon "x" text-muted, solo visible con valor
```

#### MapPreview.jsx
```jsx
// Contenedor del mapa Mapbox (tema oscuro personalizado)
// estructura: rounded-[14px] border border-gold/18 overflow-hidden relative
//   mapa interno: w-full min-h-[300px] h-full (responsive)
// overlay inferior: absolute bottom-3 left-3
//                   bg-bg/80 border border-gold/18 rounded-[8px]
//                   px-3 py-1.5 text-xs text-muted flex items-center gap-1.5
```

#### PriceTag.jsx
```jsx
// Card de resultado completo: label + Price + DistanceInfo
// estructura: bg-surface border border-gold/18 rounded-[14px] p-4
//             flex flex-col gap-3.5
// label sección: text-label uppercase tracking-widest text-muted text-center
```

#### CitySelect.jsx / CountrySelect.jsx
```jsx
// Select nativo estilizado / buscador de ciudades
// base: bg-surface-2 border border-gold/18 rounded-sm
//       px-3.5 py-2.5 text-sm text-ink w-full
// CitySelect usa GeoNames API como fuente primaria (fallback Mapbox)
```

---

### ORGANISMS — `src/ui/organisms/`

Secciones completas de UI. Pueden tener props de datos pero no lógica de Firebase/routing.

#### OnboardingStepStore.jsx
```jsx
// Paso 1 del wizard: datos del local
// Contiene: FormField×4 (nombre, teléfono, país, ciudad), SearchBox, MapPreview
// layout: flex flex-col gap-4
```

#### OnboardingStepCouriers.jsx
```jsx
// Paso 2 del wizard: agregar repartidores
// Contiene: fila de add (nombre + teléfono + botón), lista de repartidores
// CourierItem: bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5
```

#### OnboardingStepPricing.jsx
```jsx
// Paso 3 del wizard: tarifas por distancia
// Contiene: headers (text-label), filas grid-cols-3 (Input desde/hasta/precio)
```

#### OnboardingStepSuccess.jsx
```jsx
// Paso final: confirmación
// Contiene: check grande gold, título display, subtítulo, Button primario
```

#### SettingsTabStore.jsx / SettingsTabCouriers.jsx / SettingsTabPricing.jsx
```jsx
// Idénticos en estructura a sus pares de Onboarding
// Diferencia: Button "Guardar cambios" al pie
// wrapper: bg-surface border border-gold/18 rounded-[14px] p-5
```

---

### TEMPLATES — `src/ui/templates/`

Solo definen layout — sin lógica ni estilos de contenido. Todos los templates usan `max-w-7xl` como ancho máximo de página.

#### AppLayout.jsx
```jsx
// Layout principal autenticado
// estructura: min-h-screen bg-bg bg-page-warm flex flex-col
//   Header (max-w-7xl, fijo arriba)
//   <main className="flex-1 w-full max-w-7xl mx-auto px-7 py-6">{children}</main>
```

#### AuthLayout.jsx
```jsx
// Layout para login y registro
// estructura: min-h-screen bg-bg bg-page-warm flex flex-col
//   Header simplificado (solo logo, max-w-7xl)
//   <main className="flex-1 flex items-center justify-center px-4 py-8">
//     <div className="w-full max-w-sm">{children}</div>
//   </main>
```

#### OnboardingLayout.jsx
```jsx
// Layout del wizard
// estructura: min-h-screen bg-bg bg-page-warm flex flex-col
//   Header (solo logo, max-w-7xl)
//   <main className="flex-1 w-full max-w-7xl mx-auto px-7 py-6">
//     HeaderStepIndicator (centrado, fuera del Header)
//     <div className="w-full max-w-5xl mx-auto mt-6 bg-surface border border-gold/18 rounded-[14px] p-6">
//       {children}
//     </div>
//   </main>
```

#### SettingsLayout.jsx
```jsx
// Layout de configuración
// estructura: min-h-screen bg-bg bg-page-warm flex flex-col
//   Header (max-w-7xl)
//   <main className="max-w-7xl mx-auto w-full px-7 py-6">
//     tabs + contenido
//   </main>
```

---

## 4. HeaderStepIndicator

Vive en `src/ui/Header/HeaderStepIndicator.jsx`. Renderizado DENTRO del `<main>`, no dentro del `<Header>`.

### Visual
- Círculos conectados por línea horizontal
- 3 pasos: Local → Repartidores → Tarifas
- Estados por paso:

| Estado      | Círculo                                              | Label                          | Línea hacia siguiente   |
|-------------|------------------------------------------------------|--------------------------------|-------------------------|
| `completed` | `bg-gold border-gold` + ícono check `#1a0f00`       | `text-gold-dim font-medium`    | `bg-gold`               |
| `active`    | `bg-transparent border-2 border-gold` + número gold  | `text-ink font-semibold`       | `bg-muted/30`           |
| `pending`   | `bg-transparent border border-muted/40` + número muted | `text-muted`                 | `bg-muted/30`           |

---

## 5. Patrones de pantalla

### Auth (Login / Registro)
```
AuthLayout (max-w-7xl externo)
  └── Card max-w-sm centrado (bg-surface border-gold/18 rounded-[14px] p-7)
        ├── font-display title text-center
        ├── FormField × n
        ├── Button primary full-width
        ├── Divider border-gold/18
        ├── Button secondary "Google"
        └── link navegación
```

### Onboarding (wizard)
```
OnboardingLayout (max-w-7xl)
  ├── Header → solo logo
  └── main (max-w-7xl)
        ├── HeaderStepIndicator (centrado)
        └── Card max-w-5xl (bg-surface border-gold/18 rounded-[14px] p-6)
              └── Step content + navegación
```

### Calcular (vista principal)
```
AppLayout (max-w-7xl)
  └── grid grid-cols-1 lg:grid-cols-2 lg:min-h-[calc(100vh-104px)]
        ├── Panel izq (lg:border-r border-gold/18 + border-b en mobile)
        │     ├── h1 "Calcular Envío" (text-4xl font-display)
        │     ├── SearchBox + CourierSelect + Button
        │     └── PriceTag + DistanceInfo + ActionButtons (resultado)
        └── Panel der (flex-col, MapPreview flex-1)
              ├── h2 "Ruta" + badge ciudad
              └── MapPreview (brand-dark, fill flex)
```

### Configuración
```
SettingsLayout (max-w-7xl)
  ├── subnav tabs (Local | Repartidores | Tarifas)
  └── SettingsTab{Store|Couriers|Pricing} (según tab activo)
```

### Landing
```
bg-bg bg-page-warm
  ├── Header (ghost + primary buttons, max-w-7xl)
  ├── main
  │   ├── Hero (max-w-7xl, tag + h1 display-lg + p + Button)
  │   └── Features grid (max-w-7xl, 3× FeatureCard)
  └── footer
```

---

## 6. Espaciado y layout

| Contexto                        | Valor                          |
|---------------------------------|--------------------------------|
| Ancho máximo de página          | `max-w-7xl` (unificado)        |
| Padding card grande             | `p-5` — `p-7`                  |
| Padding topbar                  | `px-7 py-3.5`                  |
| Gap entre FormFields            | `gap-4`                        |
| Gap entre stat boxes            | `gap-2`                        |
| Gap label → input               | `mb-1.5`                       |
| Border radius card              | `rounded-[14px]`               |
| Border radius input / botón     | `rounded-sm` (8px)             |
| Ancho max formulario auth       | `max-w-sm` (384px)             |
| Ancho max card onboarding       | `max-w-5xl` (1024px)           |

---

## 7. Reglas de consistencia

1. **Todos los bordes** de cards e inputs usan `border border-gold/18` — nunca `border-px` (no es clase Tailwind válida) ni `border` estándar.
2. **Nunca `bg-white` ni `bg-black`** — todo usa tokens del design system.
3. **Fraunces solo para display** — logo, títulos, precio. El resto es DM Sans.
4. **Labels de formulario siempre** en `text-label uppercase tracking-widest text-muted`.
5. **Asterisco de campo requerido** siempre en `text-gold-dim`, nunca en rojo.
6. **Hover states** usan `bg-surface-tint` en elementos interactivos sobre surface.
7. **Botón CTA** siempre `bg-btn-primary` con texto `text-[#1a0f00]`.
8. **Animaciones**: precio → `animate-price-in`, secciones → `animate-slide-up`.
9. **Átomos nunca tienen margin propio** — el espaciado lo define siempre el padre.
10. **HeaderStepIndicator** dentro de `<main>`, no dentro de `<Header>`.
11. **Opacidad en bordes** usa modificador `/18`, `/25`, `/35` — no nombres como `border-gold-strong`.
12. **Mapa** usa `dark-v11` con tema de marca personalizado (`useMapboxMap.js`).
13. **Ciudades** se obtienen vía GeoNames API con fallback a Mapbox.

---

## 8. Lo que NO hacer

- ❌ No usar `font-sans` para títulos — usar `font-display: Fraunces`
- ❌ No usar `border-gray-*` ni `bg-gray-*` — todo usa tokens propios
- ❌ No usar `rounded-lg` o `rounded-xl` — usar `rounded-sm` (inputs) o `rounded-[14px]` (cards)
- ❌ No poner fondo sólido plano en páginas — siempre `bg-bg bg-page-warm`
- ❌ No usar colores hardcodeados en JSX — solo clases Tailwind del design system
- ❌ No poner lógica de negocio en atoms ni molecules
- ❌ No importar organisms desde atoms o molecules
- ❌ No usar `border-px` — no es una clase Tailwind válida
- ❌ No usar `border-gold-strong` — usar `border-gold/35`
- ❌ No hardcodear el mapa en `streets-v12` — usar `dark-v11` con tema de marca

---

## 9. Checklist antes de marcar un componente como listo

- [ ] ¿Está en el nivel correcto del atomic design?
- [ ] ¿Usa `bg-surface` o `bg-surface-2` como fondo base?
- [ ] ¿Tiene `border border-gold/18` si es card o input?
- [ ] ¿El título usa `font-display`?
- [ ] ¿Los labels usan `text-label uppercase tracking-widest text-muted`?
- [ ] ¿El botón principal usa `bg-btn-primary`?
- [ ] ¿El texto principal usa `text-ink` y el secundario `text-muted`?
- [ ] ¿La página wrapper tiene `bg-bg bg-page-warm`?
- [ ] ¿El átomo acepta `className` como prop?
- [ ] ¿El átomo no tiene margin propio?
- [ ] ¿HeaderStepIndicator recibe `currentStep` como prop dinámica?
- [ ] ¿Los bordes usan modificador de opacidad (`border-gold/18`, `/25`, `/35`)?
