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
5. Display results with WhatsApp/Print options
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

Message format (from `whatsappService`):
```
¡Hola! Te paso los datos del envío:

🏪 Local: [storeName]
📍 Dirección: [address]
📦 Distancia: [distance] km
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
2. Add unit tests for `deliveryService.js` (price calculation logic)
3. Implement proper form validation (react-hook-form)
4. Add skeleton loaders instead of spinners

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