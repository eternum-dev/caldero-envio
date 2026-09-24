# Deducción server-side + Migración Sesión 3.5

**Feature**: implementar deducción de calderos al calcular + ejecutar la Sesión 3.5 (migración retroactiva de 2 locales activos con 50 calderos cada uno).
**Branch**: `feature/deduccion-y-migracion-3.5`
**Ventana de deploy**: sábado 27 sep 2026 00:00 CLT → lunes 28 sep 13:00 CLT (deadline duro)
**Coordinación sábado**: sesión en vivo, ambos presentes
**Servicio acumulado prev**: 0
**TDD**: cuando aplique — tests E2E con `node --test` siguiendo el patrón existente

---

## 🎯 Objetivo

1. **Implementar deducción server-side**: cada cálculo descuenta -1 caldero del campo `accounts/{uid}.creditsBalance` y registra un documento `transaction` con `type: 'deduction'`. Reabre la decisión LOCKED #13 del playbook #366 (la deducción prevista para v1.1 se adelanta a v1).
2. **Ejecutar la Sesión 3.5**: script idempotente que crea `accounts/{uid}` con 50 calderos para los 2 locales activos que aún no tienen cuenta, sin tocar sus `users/{uid}` (solo asegura `schemaVersion: 1`).

---

## 🟥 Restricciones críticas

- **No desplegar deducción a producción antes del sábado 27 sep 00:00 CLT**. Si se despliega antes, los 2 locales activos rompen su flujo porque no tienen `accounts/{uid}`.
- **Los locales existentes no deben perder servicio**. La Sesión 3.5 debe ejecutarse antes (o de forma simultánea) al deploy de deducción. De ahí la ventana coordinada.
- **Ventana del sábado**: 37 horas desde la madrugada del sábado hasta el mediodía del lunes. El domingo completo queda como margen.
- **Idempotencia obligatoria** en todo lo nuevo (`spendCaldero`, scripts de migración).
- **`users/{uid}` es sagrado**. La migración solo agrega `schemaVersion: 1` con `merge: true`, nunca reemplaza campos.

---

## 📋 Task list

### Fase 1 — Implementación en rama (jueves 24 sep)

| # | Task | Archivo | Effort | Commit |
|---|------|---------|--------|--------|
| T1 | Crear este feature doc | `odd/tasks/deduccion-y-migracion-3.5.md` | 5 min | docs |
| T2 | Implementar la CF `spendCaldero` (2nd gen, `southamerica-east1`) | `functions/calderos/spendCaldero.js` | 1 h | feat(functions) |
| T3 | Test unit de `spendCaldero` (success, sin saldo, idempotente, sin auth) | `functions/calderos/spendCaldero.test.js` | 1.5 h | test(functions) |
| T4 | Wire-up en `functions/index.js` | `functions/index.js` | 5 min | feat(functions) |
| T5 | Service wrapper de frontend `httpsCallableFromURL` | `src/services/calderoService.js` | 20 min | feat(services) |
| T6 | Modificar `useDeliveryCalculator.calculate()` para invocar `spendCaldero` antes del cálculo | `src/hooks/useDeliveryCalculator.js` | 30 min | feat(hooks) |
| T7 | Script de intake (lista 2 usuarios Auth + `providerData` + shape de `users/{uid}`) | `functions/scripts/intake-legacy-users.js` | 30 min | chore(scripts) |
| T8 | Script de migración (50 cald, idempotente, dry-run + flag `--execute`) | `functions/scripts/migrate-legacy-users.js` | 1 h | chore(scripts) |

**Por qué `functions/scripts/` y no `scripts/`** (decisión de path): los scripts usan `firebase-admin@^11.11.0`, que ya está instalado como dependencia de `functions/`. Ubicarlos en `scripts/` raíz habría requerido duplicar la dependencia o manipular `require()` con paths absolutos. `functions/scripts/` los mantiene junto al código que se va a desplegar, compartiendo `node_modules` y `package.json`.

**Effort Fase 1**: ~5 h

### Fase 2 — Tests E2E + dry-run (viernes 25 sep)

| # | Task | Effort |
|---|------|--------|
| T9 | Test E2E con emulador: signup → 10 cald → calcular 11 veces → saldo 0 + error en la 11ª | 1 h |
| T10 | Test E2E: deducción + recarga por compra → saldo consistente | 30 min |
| T11 | Test E2E de idempotencia (2 llamadas con mismo key = solo 1 débito) | 20 min |
| T12 | Dry-run del script de migración con emulador (2 usuarios fake) | 30 min |
| T13 | Sanity check: `npm test` + `lint` + `build` todos en verde | 30 min |

**Effort Fase 2**: ~3 h

### Fase 3 — Merge + preparar la ventana del sábado (viernes tarde)

| # | Task | Effort |
|---|------|--------|
| T14 | PR a main con todos los commits | 30 min |
| T15 | Actualizar el playbook #366 con la nueva decisión (deducción movida de v1.1 → v1) | 15 min |
| T16 | Crear README del sábado con los pasos exactos del deploy | 30 min |

**Effort Fase 3**: ~1.5 h

### Fase 4 — Deploy + migración (sábado 27 sep 00:00 CLT)

| # | Task | Responsable | Tiempo |
|---|------|-------------|--------|
| T17 | Deploy de la CF `spendCaldero` (`firebase deploy --only functions:spendCaldero`) | Implementador | 3 min |
| T18 | Smoke test de `spendCaldero` con usuario nuevo | Implementador | 2 min |
| T19 | Build + deploy de frontend con deducción (`npm run build && firebase deploy --only hosting`) | Implementador | 5 min |
| T20 | Dry-run del script de migración | Implementador (output para revisión) | 1 min |
| T21 | Ejecutar el script con `--execute` | Operador (con su `serviceAccount.json`) | 1 min |
| T22 | Verificar el saldo de los 2 locales en la consola de Firebase | Ambos | 2 min |
| T23 | Smoke test final con ambos locales | Ambos | 5 min |

**Effort Fase 4**: ~20 min de ventana activa

### Fase 5 — Buffer (domingo 28 sep)

- [ ] Si algo falla: investigar, corregir, volver a desplegar. El domingo queda libre de locales.

### Fase 6 — Deadline (lunes 28 sep 13:00 CLT)

- [ ] Verificación final antes de que los locales abran.

---

## 📐 Diseño técnico

### `spendCaldero` — Cloud Function

**Patrón**: 2nd gen `onCall` con `region: 'southamerica-east1'`, `cors: CORS_ALLOWED_ORIGINS`, handler separado para facilitar testing.

**Flujo**:
1. Verifica `context.auth` → `HttpsError('unauthenticated')` si falta.
2. `runTransaction`:
   - Lee `accounts/{uid}`. Si no existe → `HttpsError('not-found')`.
   - Si se proporcionó `idempotencyKey`, busca una transacción existente con ese mismo key → respuesta idempotente.
   - Si `creditsBalance <= 0` → `HttpsError('failed-precondition', 'Sin calderos...')`.
   - Resta 1 a `creditsBalance`.
   - Crea `transactions/{txId}` con `type: 'deduction', amount: -1, externalReference: ${uid}_deduction_${nanoid(12)}`.
3. Devuelve `{ success, balanceAfter, transactionId, idempotent }`.

**No toca**: `freeCalderosUsed`, `lifetimeCredits`, `lastTopUpAt`, `totalTopUps` (esos son del grant inicial y de compras).

### `useDeliveryCalculator.calculate()` — frontend

**Flujo nuevo**:
1. `spendCaldero({ idempotencyKey: nanoid(12) })` ANTES del cálculo real.
2. Si devuelve `failed-precondition` → `setError('No te quedan calderos. Comprá más.')` y retorna de inmediato.
3. Si tiene éxito → continúa con `getDistance` + `calculatePrice` como hasta ahora.
4. `useCredits` ya es reactivo, el saldo se actualiza solo.

### `scripts/intake-legacy-users.js` — Discovery de solo lectura

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

### `scripts/migrate-legacy-users.js` — Backfill con 50 calderos

**Flags**:
- Sin flag → `dry-run` (solo registra qué haría).
- `--execute` → realiza las escrituras.
- `--uid <UID>` → solo ese UID (útil para probar el script).

**Salida dry-run**:
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

**Salida real**:
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

**Idempotencia**: si ya existe `accounts/{uid}` con `migrationSource: 'legacy-user-thank-you'`, lo saltea con un log.

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

### Manual E2E (con emulador)

- [ ] `npm test` en functions pasa
- [ ] En la app local (emulador): signup → ver saldo 10 → calcular 5 veces → saldo 5
- [ ] Signup → calcular 11 veces → saldo 0 en la 11ª → error en la 11ª ("Sin calderos")
- [ ] Recargar con un paquete mock en sandbox → saldo sube → calcular vuelve a funcionar
- [ ] Idempotencia: con el mismo key, 2 llamadas solo restan 1

---

## 🔗 Enlaces útiles

- Playbook actual: obs #366 (engram `sdd/revisar-monetizacion/playbook`)
- Plan original de la Sesión 3.5: obs #374 (engram `sdd/revisar-monetizacion/session-3.5-migration`)
- Postmortem: obs #739
- Decisión sobre la ventana del sábado: obs `decisions/sesion-3-5-window-weekend-26sep2026`
- CF de referencia: `functions/calderos/createAccountWithFreeTier.js` (mismo patrón 2nd gen)
- Hook de referencia: `src/hooks/useCredits.js` (mismo patrón reactivo)

---

## ✅ Definition of Done

- [ ] Todos los tests pasan (`npm test` en functions y en frontend)
- [ ] Lint sin errores
- [ ] Build sin errores
- [ ] PR mergeada a main antes del viernes 25 sep por la tarde
- [ ] Playbook #366 actualizado con la decisión de adelantar la deducción
- [ ] README del sábado listo
- [ ] Deploy + migración ejecutados el sábado 00:00 CLT
- [ ] Smoke test pasa con los 2 locales reales (sábado en la ventana)
- [ ] Verificación final el lunes 13:00 CLT antes de que los locales abran

---

## 🆘 Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| `spendCaldero` rompe el flujo libre actual | Implementar todo en la rama, no desplegar antes del sábado |
| El `serviceAccount.json` del operador se filtra | No commitear el archivo. Agregarlo a `.gitignore` si no está |
| El script de migración duplica calderos | Idempotencia + chequeo de `metadata.migrationSource` antes de escribir |
| En la madrugada del sábado falla algo | Buffer completo del domingo. Plan de rollback: borrar `accounts/{uid}` creados, no tocar `users/{uid}` |
| El emulador se comporta distinto a producción | Testear con emulador el viernes. Smoke test en producción tras el deploy |
| Los 2 locales usan email/password (no Google) | El script de migración los cubre retroactivamente, sin importar el método de auth |
