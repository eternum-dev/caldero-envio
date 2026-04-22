# Sesión 01 - PRODUCTO

## Estado: Pendiente

## Descripción

**Caldero Envío** es una aplicación de gestión de entregas para negocios locales con servicio de delivery. Permite calcular precios y tiempos de envío de forma automática basándose en la distancia y reglas configurables.

## Usuarios

| Usuario | Rol | Descripción |
|---------|-----|-------------|
| Cajero | Principal | Ingresa direcciones, selecciona repartidor, genera cálculos |
| Repartidor | Secundario | Recibe información del envío por WhatsApp |
| Admin | Futuro | Gestión de múltiples locales |

## Flujo del Usuario Cajero

```
1. Iniciar sesión
   ↓
2. Completar onboarding (1 sola vez)
   - Datos del local (nombre, dirección, coordenadas)
   - Agregar repartidores
   - Configurar tarifas por distancia
   ↓
3. Pantalla principal (App)
   - Ingresar dirección de destino
   - Seleccionar repartidor
   - Calcular envío
   ↓
4. Ver resultados
   - Precio del envío
   - Distancia
   - Tiempo estimado
   - Mapa de la ruta
   ↓
5. Acciones
   - Enviar por WhatsApp al repartidor
   - Imprimir ticket
   - Nueva búsqueda
```

## Flujo del Repartidor

```
1. Recibe mensaje de WhatsApp
   ↓
2. Ve información del envío
   - Dirección del cliente
   - Precio del envío
   - Distancia
   ↓
3. Confirma entrega (futuro)
```

## Pantallas

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Landing | `/` | Página de inicio pública |
| Login | `/login` | Inicio de sesión |
| Register | `/register` | Registro de usuario |
| Onboarding | `/onboarding` | Setup inicial (4 pasos) |
| App | `/app` | Pantalla principal de cálculo |
| Settings | `/settings` | Configuración del local |

## Mapa de Navegación

```
Landing
├── Login
│   └── App (si auth)
├── Register
│   └── Onboarding → App (si auth + completado)
└── App (si auth)

App
├── Header: Calcular | Configuración | Usuario
└── Settings
    ├── Tab: Local
    ├── Tab: Repartidores
    └── Tab: Tarifas
```

## Tareas

- [ ] Definir actores de usuario adicionales
- [ ] Documentar casos de edge (sin cobertura, dirección no encontrada)
- [ ] Definir métricas de éxito (tiempo de cálculo, conversiones)

## Decisiones