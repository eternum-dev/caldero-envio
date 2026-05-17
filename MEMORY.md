# Memory - Caldero Envío

This file contains detailed project context to help the agent understand the system without needing to re-read every file.

---

## Project Origin

**Problem solved**: Local restaurant delivery logistics
- Previously: rely on courier judgment for price and time → inconsistent
- Now: systematic calculation based on distance and configurable pricing rules

**Evolution**: Started as custom solution for one client, now being rebuilt as a general-purpose SaaS.

---

## Architecture Decisions

### Why Atomic Design?
- Clear separation of concerns
- Reusable components across the app
- Easy to maintain design consistency

### Why Context for State?
- Simple enough project that Redux/Zustand is overkill
- React Context is built-in and sufficient
- Three contexts cover all domains: Auth, Store, Delivery

### Why Mapbox for Geocoding + Directions?
- Free tier is generous for development
- Single provider for both geocoding and routing
- Static maps API for preview images
- **Resiliencia**: MapCN está en evaluación como backup por si Mapbox falla o se acaban los límites

### Why Firebase?
- Auth + Firestore cover all backend needs
- No server to manage
- Free tier sufficient for start

---

## Business Logic

### Price Calculation Flow

```
1. User enters address
2. geocodeAddress() → coordinates
3. User selects courier
4. calculate() runs:
   - getDistance(origin, destination) → distance + time
   - calculatePrice(distance, pricingRules) → final price
   - getStaticMapUrl() → map preview image
5. Display results with distance, time, price
6. Generate WhatsApp link to send delivery data to courier
```

### Pricing Rules Structure

```javascript
{
  minKm: 0,
  maxKm: 3,
  price: 150
},
{
  minKm: 3,
  maxKm: 5,
  price: 200
},
// For distances beyond last rule:
{
  minKm: 5,
  maxKm: null,
  price: 200,
  pricePerKm: 50  // Extra charge per km beyond 5
}
```

### WhatsApp Integration

```
generateWhatsAppLink(phone, message)
→ wa.me/549XXXXXXXXX?text=encoded_message
```

Message format (from `whatsappService`) — enviado al **repartidor**:
```
¡Hola! Te paso los datos del envío:

🏪 Local: [storeName]
📍 Dirección: [address]
📦 Distancia: [distance] km
⏱️ Tiempo estimado: [time] min
💰 Precio: $[price]

¡Gracias!
```

---

## Current Implementation State

### Completed Features
- [x] User authentication (Firebase Auth)
- [x] Onboarding flow (store setup, courier management)
- [x] Address search with geocoding
- [x] Route calculation (Mapbox Directions API)
- [x] Price calculation (tiered pricing rules)
- [x] Map preview (Mapbox Static Images)
- [x] WhatsApp integration (message generation)
- [x] Print functionality (browser print window)

### Routes
```
/              → Landing (public)
/onboarding    → Store setup (unauthenticated)
/register      → Sign up (unauthenticated)
/login         → Sign in (unauthenticated)
/app           → Main delivery calculator (authenticated)
/settings      → Store/courier management (authenticated)
```

### Contexts State Shape

**AuthContext**:
```javascript
{ user, loading, login, register, signOut }
```

**StoreContext**:
```javascript
{
  store: { id, name, address, originCoordinates, pricingRules },
  couriers: [{ id, name, phone }],
  loading
}
```

**DeliveryContext**:
```javascript
{
  address: string,
  coordinates: { lat, lng } | null,
  courierId: string,
  distance: number | null,
  time: number | null,
  price: number | null,
  routeUrl: string | null,
  mapImage: string | null
}
```

---

## Key Files Reference

### Services (Business Logic)
- `src/services/deliveryService.js` → price calculation, message formatting
- `src/services/mapService.js` → geocoding, routing, static maps
- `src/services/whatsappService.js` → WhatsApp link generation
- `src/services/storeService.js` → Firebase Firestore operations
- `src/services/cacheService.js` → address caching

### Hooks
- `src/hooks/useDeliveryCalculator.js` → orchestration hook for delivery flow
- `src/hooks/useDebounce.js` → debounce utility

### Config
- `src/config/firebase.js` → Firebase app init
- `src/config/mapbox.js` → Mapbox token export

---

## Technical Considerations

### Caching Strategy
Address geocoding results are cached in memory (via `cacheService`) to avoid repeated API calls during a session. This is in-memory only (not persistent).

### Error Handling
- Mapbox errors: "Mapbox token no configurado" / "Dirección no encontrada" / "No se pudo calcular la ruta"
- Firebase errors: Propagated from auth/firestore operations
- Validation errors: Inline in components (e.g., "Selecciona un repartidor")

### Performance Notes
- `SearchBox` uses debounce (500ms) before geocoding
- Static map image is generated server-side by Mapbox API
- No lazy loading currently implemented (components are small)

---

## Potential Improvements (Technical Debt)

### Short Term
1. Add loading states to individual operations (not just global spinner)
2. Error boundaries for graceful failure handling
3. Cache persistencia (localStorage for addresses)
4. Input validation library (Zod or similar)

### Medium Term
1. Lazy load `AppLayout` components
2. Add unit tests para deliveryService.js (price calculation logic) - en proceso
3. Implement proper form validation (react-hook-form)
4. Migrar de Tailwind only a **Tailwind + shadcn/ui** para componentes más consistentes
5. Add skeleton loaders instead of spinners

### Long Term
1. Offline support (PWA with service workers)
2. Real-time updates for courier availability
3. Admin dashboard for multiple stores
4. Email notifications for delivery confirmation

---

## Design Tokens (from tailwind.config.js)

```javascript
colors: {
  surface: {
    DEFAULT: '#121110',        // Background
    container_low: '#1d1b1a',  // Cards low emphasis
    container: '#211f1e',      // Cards
    container_high: '#363433',  // Elevated cards
    container_highest: '#403d3c' // Highest elevation
  },
  primary: {
    DEFAULT: '#6F4E37',         // Primary buttons
    container: '#503828',       // Primary variant
    fixed_dim: '#8B7355'        // Muted primary
  },
  secondary: '#FFBF00',        // Accent/highlights
  tertiary: '#F5F5DC',          // Tertiary text
  on_surface: '#e6e1df',        // Primary text
  on_surface_variant: '#d4c3ba' // Secondary text
}
```

---

## MVP Revenue Readiness Assessment

### Estado general

El core de negocio está funcionando. Un usuario puede registrarse, configurar su local/repartidores, calcular un envío y mandarlo por WhatsApp. **El flujo completo existe.** Lo que falta para que sea un producto comercializable es confianza, terminación y un modelo de cobro.

---

### ✅ Funcionalidades Existentes (working)

| Feature | Estado | Notas |
|---------|--------|-------|
| Auth (registro/login) | ✅ Listo | Firebase Auth |
| Onboarding (alta de local) | ✅ Listo | Con SearchBox + mapa, pero sin editar pricing después |
| Gestión de repartidores | ✅ Listo | CRUD completo en Settings |
| Búsqueda de direcciones | ✅ Listo | Mapbox geocoding con filtro por país |
| Cálculo de precio | ✅ Listo | Pricing rules configurables por tramo |
| Cálculo de ruta + tiempo | ✅ Listo | Mapbox Directions API |
| Mapa interactivo | ✅ Listo | Polyline decodificada mostrando ruta real |
| Link WhatsApp | ✅ Listo | Mensaje con todos los datos al repartidor |
| Impresión | ✅ Listo | Browser print |
| Configuración de país | ✅ Listo | Onboarding + Settings |

---

### 🔲 Funcionalidades que Faltan (must-have para revenue)

| Feature | Prioridad | Notas |
|---------|-----------|-------|
| **Landing presentable** | 🔴 Alta | Existe Landing.jsx pero es "precaria". Es la primera impresión comercial. |
| **Editar pricing desde Settings** | 🔴 Alta | Hoy se configura solo en Onboarding. Un local necesita ajustar precios sin rehacer todo. |
| **Modelo de cobro** | 🔴 Alta | No existe billing/suscripción. Sin esto no hay revenue. |
| **Skeleton loaders** | 🟡 Media | Spinners son ok pero dan menos confianza que skeletons |
| **Empty states** | 🟡 Media | Mensajes cuando no hay repartidores, no hay dirección, etc. |
| **Refactor + tests** | 🟡 Media | En proceso. Necesario para confianza al hacer cambios. |
| **shadcn/ui** | 🟡 Media | En evaluación. Mejora consistencia visual. |
| **Respaldo Mapbox (MapCN)** | 🟡 Media | En evaluación. Resiliencia ante caída de Mapbox. |

---

### ⚠️ Funcionalidades a Medias (half-done)

| Feature | Estado | Qué falta |
|---------|--------|-----------|
| **Landing page** | ⚠️ Funcional pero precaria | Diseño, copy, credibilidad, explicación clara del producto |
| **Onboarding flow** | ⚠️ Funciona | Necesita mejor validación de inputs y feedback visual |

---

### 📋 Check de Readyness para Revenue

**Minimum Viable Monetization (MVM):**
- [ ] Landing que transmita confianza y explique el producto
- [ ] Skeleton loaders al menos en las pantallas principales
- [ ] Empty states en CourierSelect y AddressInput
- [ ] Tests cubriendo core business logic (deliveryService price calculation)
- [ ] Sistema de compra de calderos implementado (pago + habilitación de saldo)
- [ ] Página de selección de tiers con valores reales

**Si tienes estos 6 puntos: está listo para un primer cliente paying.**

---

## Modelo de Monetización — Calderos

### Concepto Central

| Término | Definición |
|---------|-----------|
| **Caldero** | 1 cálculo de ruta. Se descuenta al hacer click en "calcular", no al ingresar dirección. |
| **Prueba gratuita** | 5 cálculos disponibles para siempre. Sin fecha de corte. Mientras no los uses, siguen ahí. |
| **Compra suelta** | Paquetes de 200 o 500 calderos. Sin funciones extra. |
| **Suscripción S** | X calderos/mes + función extra: multi-step (envíos concatenados) |
| **Suscripción M** | Y calderos/mes + funciones extra: multi-step + multi-sucursal + memoria de envíos + PWA fallback |
| **Calderos extra** | Se pueden comprar aparte aunque tengas suscripción activa |
| **Alertas** | Sistema avisa cuando quedan pocos calderos |
| **Corte por falta de pago** | Se le corta el servicio. Días de gracia. Puede cambiar de plan. No hay tier free. |
| **Data tras corte** | Guardada máximo 1 mes |
| **Pago** | Botón de pago con link (e-commerce), no transferencia manual. Si falla, reintentar. Si pasa, se habilitan calderos y se avisa. |

### Detalles del Corte

- Si se acaban los calderos y no hay respuesta, se corta
- Aviso previo cuando queden pocos (quedan X,anda a comprar)
- Cuando se acaban: pantalla bloqueada con "comprá más calderos"
- Después del corte: 1 mes para volver y recuperar data, después se borra

### Funcionalidades por Tier

| Tier | Funcionalidades extras |
|------|----------------------|
| Compra suelta (200/500) | Solo cálculos |
| Suscripción S | + Multi-step delivery |
| Suscripción M | + Multi-step + Multi-sucursal + Memoria de envíos + PWA fallback |

*Los valores de calderos y precios aún no están definidos.*

---

## Pendientes — Modelo de Monetización

Lo siguiente **no está definido aún** y debe trabajarse cuando corresponda:

| Pendiente | Notas |
|-----------|-------|
| **Valores de calderos** | Cuántos trae cada tier (S, M) y cuántos vienen en compra suelta (200/500 era idea) |
| **Precios en CLP** | Benchmarkear con alternativas del mercado antes de fijar |
| **Cuántos calderos = "pocos"** | ¿3? ¿5? ¿10? — definir umbral de alerta |
| **Cuántos días de gracia** | ¿3? ¿7? ¿15? — definir antes de implementar corte |
| **Funcionalidad exacta de Plus/Plus Plus** | Qué incluye cada tier además de cantidad de calderos (ej: qué es "memoria de envíos", alcance real del PWA fallback) |
| **Cómo se compra caldera extra siendo suscriptor** | ¿Mismo botón de pago? ¿Se le descuenta del paquete? — definir UX |
| **Twilio para WhatsApp a clientes** | Idea para plus/plus plus, no definido aún si va o no |
| **Plataforma de pago** | ¿MercadoPago? ¿Stripe? ¿Otro? — definir cuando se implemente |
| **Link de pago automático** | Cómo se genera, cómo se valida que pasó, flujo de error |