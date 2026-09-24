# Deducción server-side + Migración Sesión 3.5

**Feature**: Implementar deducción de calderos al calcular + ejecutar Sesión 3.5 (migración retroactiva de 2 locales activos con 50 calderos cada uno).
**Branch**: `feature/deduccion-y-migracion-3.5`
**Ventana de deploy**: sábado 27 sep 2026 00:00 CLT → lunes 28 sep 13:00 CLT (deadline duro)
**Coordinación sábado**: juntos vos y yo
**Servicio acumulado prev**: 0
**TDD**: cuando aplique — tests E2E con `node --test` siguiendo patrón existente

---

## 🎯 Objetivo

1. **Implementar deducción server-side** — cada cálculo descuenta -1 caldero del `accounts/{uid}.creditsBalance` y registra una `transaction` con `type: 'deduction'`. Reabre decisión LOCKED #13 del playbook #366 (la v1.1 se adelanta a v1).
2. **Ejecutar Sesión 3.5** — script idempotente que crea `accounts/{uid}` con 50 calderos para los 2 locales activos que NO tienen cuenta, sin tocar sus `users/{uid}` (solo asegurar `schemaVersion: 1`).

---

## 🟥 Constraints críticos

- **NO deployar deducción a prod antes del sábado 27 sep 00:00 CLT**. Si deployamos antes, los 2 locales activos rompen su flujo porque no tienen `accounts/{uid}`.
- **Locales existentes NO deben perder servicio**. La Sesión 3.5 debe correr antes (o junto con) el deploy de deducción. Por eso la ventana coordinada.
- **Ventana sábado**: 37h desde sábado madrugada hasta lunes mediodía. Domingo completo de buffer.
- **Idempotencia obligatoria** en todo lo nuevo (spendCaldero, scripts).
- **`users/{uid}` es sagrado**. La migración solo agrega `schemaVersion: 1` con `merge: true`, no reemplaza nada.

---

## 📋 Task list

### Fase 1 — Implementación en rama (jueves 24 sep)

| # | Task | Archivo | Effort | Commit |
|---|------|---------|--------|--------|
| T1 | Crear este feature doc | `odd/tasks/deduccion-y-migracion-3.5.md` | 5min | docs |
| T2 | Implementar CF `spendCaldero` (2nd gen, `southamerica-east1`) | `functions/calderos/spendCaldero.js` | 1h | feat(functions) |
| T3 | Test unit de `spendCaldero` (success, sin saldo, idempotente, sin auth) | `functions/calderos/spendCaldero.test.js` | 1.5h | test(functions) |
| T4 | Wire-up en `functions/index.js` | `functions/index.js` | 5min | feat(functions) |
| T5 | Service wrapper frontend `httpsCallableFromURL` | `src/services/calderoService.js` | 20min | feat(services) |
| T6 | Modificación `useDeliveryCalculator.calculate()` para llamar a `spendCaldero` antes | `src/hooks/useDeliveryCalculator.js` | 30min | feat(hooks) |
| T7 | Script de intake (lista 2 usuarios Auth + providerData + shape `users/{uid}`) | `functions/scripts/intake-legacy-users.js` | 30min | chore(scripts) |
| T8 | Script de migración (50 cald, idempotente, dry-run + --execute flag) | `functions/scripts/migrate-legacy-users.js` | 1h | chore(scripts) |

**Por qué `functions/scripts/` y no `scripts/`** (decisión de path): los scripts usan `firebase-admin@^11.11.0`, que ya está instalado como dep de `functions/`. Ponerlos en `scripts/` raíz hubiera requerido duplicar la dep o hackear `require()` con paths absolutos. `functions/scripts/` los mantiene al lado del código que va a deployar, con mismo `node_modules` y mismo `package.json`.

**Effort Fase 1**: ~5h

### Fase 2 — Tests E2E + dry-run (viernes 25 sep)

| # | Task | Effort |
|---|------|--------|
| T9 | Test E2E en emulador: signup → 10 cald → calcular 11 veces → saldo 0 + error en la 11° | 1h |
| T10 | Test E2E: deducción + recarga por compra → saldo sigue bien | 30min |
| T11 | Test E2E: idempotencia (2 calls con mismo key = solo 1 descuento) | 20min |
| T12 | Dry-run del script de migración en emulador (simula 2 usuarios fake) | 30min |
| T13 | Sanity check: `npm test` + `lint` + `build` todos pasan | 30min |

**Effort Fase 2**: ~3h

### Fase 3 — Merge + preparar ventana sábado (viernes tarde)

| # | Task | Effort |
|---|------|--------|
| T14 | PR a main con todos los commits | 30min |
| T15 | Actualizar playbook #366 con la nueva decisión (deducción movida de v1.1 → v1) | 15min |
| T16 | Crear README del sábado con pasos exactos del deploy | 30min |

**Effort Fase 3**: ~1.5h

### Fase 4 — Deploy + migración (sábado 27 sep 00:00 CLT)

| # | Task | Responsable | Tiempo |
|---|------|-------------|--------|
| T17 | Deploy de `spendCaldero` CF (`firebase deploy --only functions:spendCaldero`) | Yo | 3min |
| T18 | Smoke test de `spendCaldero` con user fresco | Yo | 2min |
| T19 | Build + deploy de frontend con deducción (`npm run build && firebase deploy --only hosting`) | Yo | 5min |
| T20 | Dry-run del script de migración | Yo (output a vos) | 1min |
| T21 | Ejecutar script con `--execute` | **Vos** (con tu serviceAccount.json) | 1min |
| T22 | Verificar saldo de los 2 locales en Firebase Console | Juntos | 2min |
| T23 | Smoke test final con ambos locales | Juntos | 5min |

**Effort Fase 4**: ~20min de ventana activa

### Fase 5 — Buffer (domingo 28 sep)

- [ ] Si algo falla: investigar, fix, redeploy. Domingo libre de locales.

### Fase 6 — Deadline (lunes 28 sep 13:00 CLT)

- [ ] Verificación final antes que los locales abran.

---

## 📐 Diseño técnico

### `spendCaldero` — Cloud Function

**Patrón**: 2nd gen `onCall` con `region: 'southamerica-east1'`, `cors: CORS_ALLOWED_ORIGINS`, handler separado para testing.

**Flujo**:
1. Verifica `context.auth` → `HttpsError('unauthenticated')` si falta.
2. `runTransaction`:
   - Lee `accounts/{uid}`. Si no existe → `HttpsError('not-found')`.
   - Lee transaction existente con mismo `idempotencyKey` si fue provisto → idempotente.
   - Si `creditsBalance <= 0` → `HttpsError('failed-precondition', 'Sin calderos...')`.
   - Resta 1 a `creditsBalance`.
   - Crea `transactions/{txId}` con `type: 'deduction', amount: -1, externalReference: ${uid}_deduction_${nanoid(12)}`.
3. Retorna `{ success, balanceAfter, transactionId, idempotent }`.

**No toca**: `freeCalderosUsed`, `lifetimeCredits`, `lastTopUpAt`, `totalTopUps` (esos son del grant inicial y de compras).

### `useDeliveryCalculator.calculate()` — frontend

**Flujo nuevo**:
1. `spendCaldero({ idempotencyKey: nanoid(12) })` ANTES del cálculo real.
2. Si tira `failed-precondition` → `setError('No te quedan calderos. Comprá más.')` y return temprano.
3. Si éxito → continuar con `getDistance` + `calculatePrice` como hoy.
4. El `useCredits` ya es realtime, el saldo se actualiza solo.

### `scripts/intake-legacy-users.js` — Read-only intake

**Salida**:
```
=== Auth Users ===
1. uid: abc123 | email: localA@example.com | provider: password | createdAt: ...
2. uid: def456 | email: localB@gmail.com | provider: google.com | createdAt: ...

=== users/{uid} shapes ===
uid: abc123
  hasCompletedOnboarding: true
  schemaVersion: 1
  email: localA@example.com
  ... (todos los campos)

uid: def456
  hasCompletedOnboarding: true
  schemaVersion: 1
  email: localB@gmail.com
  ...
```

### `scripts/migrate-legacy-users.js` — Backfill con 50 cald

**Flags**:
- Sin flag → `dry-run` (solo loguea qué haría).
- `--execute` → hace los writes.
- `--uid <UID>` → solo ese UID (para testing).

**Output dry-run**:
```
=== Mode: DRY RUN (no writes) ===

Would create accounts/abc123:
  creditsBalance: 50
  freeCalderosTotal: 50
  ...

Would create transactions/{txId}:
  type: 'free'
  amount: 50
  externalReference: 'migration-early-adopter-abc123-xyz123abc'
  metadata: { source: 'migration-3.5', legacyUser: true }

=== Summary ===
Would process: 2
Would create accounts: 2 (skip 0)
Would create transactions: 2
Estimated time: <5 sec
```

**Output real**:
```
=== Mode: EXECUTE ===

Creating accounts/abc123... OK
Creating transactions/{txId}... OK
Creating accounts/def456... OK
Creating transactions/{txId}... OK

=== Summary ===
Processed: 2
Created accounts: 2 (skipped: 0)
Created transactions: 2
Total time: 4.3s
```

**Idempotencia**: si ya existe `accounts/{uid}` con `migrationSource: 'legacy-user-thank-you'`, skip con log.

---

## 🧪 Tests a escribir

### `functions/calderos/spendCaldero.test.js`

```js
describe('spendCalderoHandler', () => {
  it('throws unauthenticated without context.auth', ...)
  it('throws not-found if account does not exist', ...)
  it('throws failed-precondition if balance is 0', ...)
  it('decrements creditsBalance by 1 on success', ...)
  it('creates a deduction transaction', ...)
  it('returns idempotent:true on second call with same key', ...)
  it('does not create duplicate transactions on retry', ...)
});
```

### Manual E2E (en emulador)

- [ ] `npm run test` en functions pasa
- [ ] En app local (emulador): signup → ver saldo 10 → calcular 5 veces → saldo 5
- [ ] Signup → calcular 11 veces → saldo 0 en la 11° → error en la 11° ("Sin calderos")
- [ ] Recargar con un paquete mock en sandbox → saldo sube → calcular funciona de nuevo
- [ ] Idempotencia: con mismo key, 2 calls solo restan 1

---

## 🔗 Links útiles

- Playbook actual: obs #366 (engram `sdd/revisar-monetizacion/playbook`)
- Sesión 3.5 plan original: obs #374 (engram `sdd/revisar-monetizacion/session-3.5-migration`)
- Postmortem: obs #739
- Decisión ventana sábado: obs `decisions/sesion-3-5-window-weekend-26sep2026`
- CF de referencia: `functions/calderos/createAccountWithFreeTier.js` (mismo patrón 2nd gen)
- Hook de referencia: `src/hooks/useCredits.js` (mismo patrón realtime)

---

## ✅ Definition of Done

- [ ] Todos los tests pasan (`npm test` en functions y frontend)
- [ ] Lint pasa
- [ ] Build pasa
- [ ] PR mergeada a main antes del viernes 25 sep tarde
- [ ] Playbook #366 actualizado con la decisión de adelantar deducción
- [ ] README del sábado listo
- [ ] Deploy + migración ejecutados el sábado 00:00 CLT
- [ ] Smoke test pasa con los 2 locales reales (sábado en la ventana)
- [ ] Verificación final el lunes 13:00 CLT antes que abran

---

## 🆘 Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| `spendCaldero` rompa el flujo libre actual | Implementar todo en rama, NO deployar antes del sábado |
| Service account del Ale se filtra | NO commitear serviceAccount.json. Agregar a .gitignore si no está |
| Script de migración duplica calderos | Idempotencia + check de `metadata.migrationSource` antes de escribir |
| Sábado a la madrugada falla algo | Buffer del domingo completo. Rollback plan: borrar accounts/{uid} creados, no tocar users/{uid} |
| El emulador se comporta distinto a prod | Testear en emulador viernes. Smoke test en prod post-deploy |
| Los 2 locales usan email/password (no Google) | El script de migración los cubre retroactivamente, sin importar auth method |
