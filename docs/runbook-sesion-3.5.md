# RUNBOOK — Sesión 3.5: Deploy + Migración Retroactiva

**Fecha de ventana:** Sábado 27 de septiembre 2026, 00:00 CLT  
**Deadline duro:** Lunes 28 de septiembre 2026, 13:00 CLT  
**Responsable:** Ale  
**Script:** `functions/scripts/migrate-legacy-users.js`  
**Rama:** `feature/deduccion-y-migracion-3.5` (9 commits adelante de `main`)

---

## Pre-flight (viernes 26 sep, antes de medianoche)

- [ ] **Obtener serviceAccount.json de producción** (si no está local)
  - Ir a Firebase Console → Project Settings → Service Accounts → Generate new private Key
  - Guardar como `functions/serviceAccount.json` (NO commitear)
  - Verificar: `Test-Path functions/serviceAccount.json`

- [ ] **Verificar que la rama esté al día**
  ```bash
  git checkout feature/deduccion-y-migracion-3.5
  git pull origin feature/deduccion-y-migracion-3.5
  ```

- [ ] **Build + tests pasan localmente**
  ```bash
  npm run build
  npm test --if-present
  ```
  > Tests pre-existentes rotos (NO bloqueantes): `handlePaymentWebhook.test.js:152`, `creditPurchase.integration.test.js:216`

---

## Paso 1: Deploy (sábado 27, ~00:00 CLT)

### 1.1 Cloud Functions (2nd gen, southamerica-east1)

```bash
cd functions
firebase deploy --only functions --project caldero-envio
```

Despliega:
- `spendCaldero` (2nd gen onCall) — deducción server-side
- `createAccountWithFreeTier` — cuenta con 10 calderos gratis en signup
- `createCheckoutSession` — sesión de MercadoPago
- `handlePaymentWebhook` — webhook MP
- `checkPurchaseStatus` — estado de compra

### 1.2 Firestore Rules

```bash
firebase deploy --only firestore:rules --project caldero-envio
```

> Nota: reglas de `users` están simplificadas (owner-only, sin field validation).
> `accounts/{userId}` y `transactions/{txId}` son server-write-only.
> La validación de schema está en application code + CFs, no en rules.

### 1.3 Hosting (frontend, opcional si no hubo cambios de UI)

```bash
npm run build
firebase deploy --only hosting --project caldero-envio
```

Solo necesario si hay cambios de UI posteriores al último deploy de hosting.

---

## Paso 2: Migración retroactiva (sábado 27, ~00:15 CLT)

### 2.1 Dry run (sin writes)

```bash
cd functions
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node scripts/migrate-legacy-users.js
```

**Verificar salida:**
- Debe listar los 2 usuarios legacy con `action: would-migrate`
- Usuarios que YA tienen `accounts/{uid}` → `action: skipped` (correcto)
- Summary debe mostrar `would-migrate: 2` (o la cantidad real de legacy users)

### 2.2 Ejecutar migración (con writes)

```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node scripts/migrate-legacy-users.js --execute
```

**Seguridad del script:**
- Idempotent: no toca usuarios que ya tienen `accounts/{uid}`
- Transacción atómica por usuario (batch: accounts + transactions + users.schemaVersion)
- 5-second abort window antes de escribir (`Ctrl-C` para cancelar)
- `externalReference` usa prefijo único `migration-early-adopter-{uid}-{nanoid}` para evitar colisiones

### 2.3 Verificar resultado

```bash
# Re-run dry para confirmar que ahora están skipped
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node scripts/migrate-legacy-users.js
```

**Expected output post-migración:**
```
skipped: todos los usuarios (ya tienen accounts/{uid})
would-migrate: 0
```

---

## Paso 3: Smoke test post-migración

### 3.1 Verificar en Firestore (Console o CLI)

Para cada uno de los 2 UIDs legacy, verificar que existe:
- `accounts/{uid}` con `creditsBalance: 50`, `freeCalderosTotal: 50`, `metadata.migrationSource: "legacy-user-thank-you"`
- `transactions/{txId}` con `type: "free"`, `amount: 50`, `metadata.source: "migration-3.5"`
- `users/{uid}` con `schemaVersion: 1`

### 3.2 Verificar en la app

1. Loguearse con una cuenta legacy
2. Ir a la sección de Calderos / Créditos
3. Verificar que muestra **50 calderos** disponibles
4. Hacer un cálculo de costo de envío → debe descontar 1 caldero (quedan 49)

### 3.3 Verificar spendCaldero

- Un cálculo exitoso debe retornar `success: true`, `creditsBalance: 49`
- Un segundo cálculo debe retornar `creditsBalance: 48`
- Sin calderos → debe retornar `error: "insufficient_credits"`

---

## Rollback (si algo falla)

### Si el deploy de functions falla
```bash
# Revert a la versión anterior de functions
firebase functions:delete spendCaldero --project caldero-envio
git checkout main -- functions/
firebase deploy --only functions --project caldero-envio
```

### Si la migración escribe datos incorrectos
1. El script es idempotente pero NO tiene undo manual
2. Para revertir: borrar manualmente `accounts/{uid}` y `transactions/{txId}` de los usuarios afectados desde Firestore Console
3. Verificar que `users/{uid}.schemaVersion` no cause problemas (debería ser seguro dejarlo en 1)

### Si firestore.rules causa problemas
```bash
git checkout main -- firestore.rules
firebase deploy --only firestore:rules --project caldero-envio
```

---

## Post-deploy checklist

- [ ] 2 usuarios legacy tienen 50 calderos en `accounts/{uid}`
- [ ] Transacciones `free` registradas con metadata `migration-3.5`
- [ ] App muestra balance correcto al loguear
- [ ] `spendCaldero` descuenta correctamente
- [ ] Eliminar `functions/serviceAccount.json` local después de la migración (si se prefiere)
- [ ] Merge de `feature/deduccion-y-migracion-3.5` → `main` (si no se hizo antes)
- [ ] Push a origin/main

---

## Referencias

- **Migration script:** `functions/scripts/migrate-legacy-users.js` (243 líneas, idempotente, dry-run default)
- **CF entry point:** `functions/index.js` (5 calderos CFs + 2 Mapbox 1st gen)
- **spendCaldero:** `functions/calderos/spendCaldero.js` (2nd gen onCall)
- **Rules:** `firestore.rules` (simplificado, server-write-only para accounts/transactions)
- **Project ID:** `caldero-envio` (`.firebaserc` default)
- **Region:** `southamerica-east1`
