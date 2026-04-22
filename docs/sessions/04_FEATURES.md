# Sesión 04 - FEATURES

## Estado: Pendiente

## Features Actuales (Implementadas)

- [x] Autenticación (email + Google)
- [x] Onboarding de local
- [x] Cálculo de envío (dirección → precio + tiempo)
- [x] Geocoding con Mapbox
- [x] Routing con Mapbox Directions
- [x] Mapa estático preview
- [x] Envío por WhatsApp
- [x] Impresión de ticket
- [x] Configuración de tarifas por distancia
- [x] Gestión de repartidores

## Features Futuras

### Corto Plazo

#### Múltiples Envíos Simultáneos
```
Descripción: Permitir crear múltiples envíos desde una misma dirección de origen
Caso de uso: Un cliente hace varios pedidos o hay que entregar a varios clientes cercanos

Estructura propuesta:
- Agregar campo orderId o batchId
- UI: Lista de envíos pendientes
- Repartidor ve todos los envíos de un batch
```

#### Historial de Envíos
```
Descripción: Guardar registro de todos los envíos calculados

Modelo:
HistoryEntry {
  id: string
  storeId: string
  courierId: string
  address: string
  coordinates: {lat, lng}
  distance: number
  time: number
  price: number
  createdAt: timestamp
  status: 'pending' | 'completed' | 'cancelled'
}

Colección: history/{userId}/entries
```

#### Rutas Guardadas
```
Descripción: Guardar direcciones frecuentes para acceso rápido

Modelo:
SavedAddress {
  id: string
  userId: string
  name: string (ej: "Casa de Juan")
  address: string
  coordinates: {lat, lng}
  lastUsed: timestamp
}
```

### Mediano Plazo

#### Optimización de Rutas
```
Descripción: Calcular la ruta más eficiente para múltiples entregas

API: Mapbox Optimization API
Consideraciones:
- Requiere licencia de Mapbox
- Implementar batching de direcciones
```

#### Notificaciones Push
```
Descripción: Alertar al repartidor cuando hay nuevo envío

Opciones:
- Firebase Cloud Messaging (FCM)
- OneSignal
- Notificaciones web nativas (Service Worker)
```

#### PWA / Offline
```
Descripción: Funcionar sin internet o con conexión lenta

Implementación:
- Service Worker para caching
- IndexedDB para datos offline
- Sync cuando vuelva conexión
```

#### Panel Admin
```
Descripción: Dashboard para gestionar múltiples locales

Funcionalidades:
- Vista de todos los locales (si es admin)
- Estadísticas de envíos
- Reportes
```

### Largo Plazo

#### App Móvil
```
Descripción: Versión native o React Native para repartidores

Consideraciones:
- Notificaciones push nativas
- GPS tracking
- Escaneo de códigos
```

#### Integración con POS
```
Descripción: Conectar con sistema de caja del local

APIs de:
- Shopify
- Mercado Pago
- Square
```

## Mapa de Features

```
v1.0 (Actual)
├── Auth
├── Onboarding
├── Cálculo básico
└── WhatsApp integration

v1.1 (Corto)
├── Historial de envíos
├── Direcciones guardadas
└── Múltiples envíos por batch

v1.2 (Mediano)
├── PWA / Offline
├── Notificaciones push
└── Dashboard básico

v2.0 (Largo)
├── Optimización de rutas
├── App móvil
├── Integraciones POS
└── Multi-tenant
```

## Dependencias Externas

| Feature | Servicio | Costo |
|---------|----------|-------|
| Maps/Rutas | Mapbox | Gratis hasta 50k requests/mes |
| Auth | Firebase | Gratis tier |
| Database | Firestore | Gratis tier |
| Notificaciones | FCM | Gratis |
| Hosting | Vercel/Netlify | Gratis tier |

## Tareas

- [ ] Priorizar features v1.1
- [ ] Estimar esfuerzo de cada feature
- [ ] Definir MVP para cada release
- [ ] Plan de testing

## Decisiones