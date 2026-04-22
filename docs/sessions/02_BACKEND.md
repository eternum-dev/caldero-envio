# Sesión 02 - BACKEND

## Estado: Pendiente

## Firebase Configuration

### Collections y Documents

```
users/
  {userId}/
    - uid: string
    - email: string
    - name: string (opcional)
    - createdAt: timestamp
    - hasCompletedOnboarding: boolean
    - storeId: string (referencia)

stores/
  {storeId}/  o  {userId}/
    - id: string
    - userId: string
    - name: string
    - phone: string
    - address: string
    - originCoordinates: { lat: number, lng: number }
    - pricingRules: PricingRule[]
    - createdAt: timestamp
    - updatedAt: timestamp

couriers/
  {userId}/
    - list: Courier[]
    - updatedAt: timestamp

  Courier {
    id: string
    name: string
    phone: string
  }

  PricingRule {
    minKm: number
    maxKm: number | null
    price: number
    pricePerKm: number (para distancia extra)
  }
```

## Estructura de Datos

### User (Firebase Auth + Firestore)

```typescript
interface User {
  uid: string;
  email: string;
  name?: string;
  createdAt: string; // ISO
  hasCompletedOnboarding: boolean;
  storeId?: string;
}
```

### Store

```typescript
interface Store {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  originCoordinates: {
    lat: number;
    lng: number;
  };
  pricingRules: PricingRule[];
}

interface PricingRule {
  minKm: number;
  maxKm: number | null; // null = infinito
  price: number;
  pricePerKm?: number; // para extra más allá de maxKm
}
```

### Courier

```typescript
interface Courier {
  id: string;
  name: string;
  phone: string;
}
```

## API de Cálculo de Rutas (Mapbox)

### Endpoints usados

| Función | Endpoint Mapbox |
|---------|----------------|
| Geocoding | `https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json` |
| Directions | `https://api.mapbox.com/directions/v5/mapbox/driving/{origin};{destination}` |
| Static Images | `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/{markers}/{path}/{width}x{height}` |

### Flujo de Cálculo

```
1. Geocodificar dirección destino
   → Mapbox Geocoding API
   → Obtener coordenadas {lat, lng}

2. Calcular ruta
   → Mapbox Directions API
   → Obtener distance (km) y duration (minutos)

3. Calcular precio
   → apply pricingRules según distance

4. Generar mapa preview
   → Mapbox Static Images API
```

## Lógica de Precios

```javascript
function calculatePrice(distance, pricingRules) {
  // 1. Buscar regla que cubra la distancia
  // 2. Si distancia > última regla con maxKm=null, aplicar pricePerKm
  // 3. Retornar precio final
}
```

## Auth y Permisos

- Firebase Auth para autenticación
- Firestore Security Rules para autorización
- USer solo puede leer/escribir sus propios datos

## Tareas

- [ ] Definir estructura de Security Rules
- [ ] Considerar cacheo de direcciones en localStorage
- [ ] Planificar migración si cambia estructura de datos
- [ ] Evaluar necesidad de Cloud Functions

## Decisiones