# RUNBOOK — Probar deducción + Sesión 3.5 en emulador local

**Objetivo**: validar el feature end-to-end (signup → free grant → calcular → deducción → script de migración) sin tocar el proyecto de producción ni romper a los 2 locales activos.

**Cuándo usarlo**: jueves 24 sep por la noche o viernes 25 sep antes del E2E con preview/staging.

---

## Pre-requisitos

- Node 20.x
- Java 11+ (lo entrega `firebase-tools` automáticamente; ya tenés Java 25 instalado)
- `firebase-tools@^11.30.0` (ya está en `devDependencies`)
- 2 GB de RAM libres para los emuladores

## Paso 1 — Configurar el `.env.local`

```powershell
Copy-Item .env.emulator .env.local
```

Revisá que `VITE_USE_FIREBASE_EMULATORS=true` esté en `.env.local`.

## Paso 2 — Arrancar el emulador en una terminal

```powershell
firebase emulators:start --only auth,firestore,functions,hosting,pubsub
```

Debería ver:
- `Emulator UI at http://127.0.0.1:4000`
- `Auth emulator at http://127.0.0.1:9099`
- `Firestore emulator at localhost:8080`
- `Functions emulator at localhost:5001`
- `Hosting emulator at localhost:5000`
- `pub/sub` (necesario para 2nd gen CFs)

**Dejar esta terminal abierta** durante toda la sesión de testing.

## Paso 3 — En otra terminal, correr los tests E2E de `spendCaldero`

```powershell
cd functions
npm test
```

Debería ver `spendCalderoHandler` con 8 tests pasando contra el emulador (no skipeados). Si skipean, el emulador no está corriendo en `localhost:8080`.

## Paso 4 — Arrancar el frontend apuntando al emulador

En una **tercera** terminal:

```powershell
npm run dev
```

Vite levanta el frontend en `http://localhost:5173`. El frontend automáticamente habla con los emuladores por el `.env.local`.

## Paso 5 — Probar el flujo end-to-end manualmente

1. Abrir `http://localhost:5173` en el browser
2. Click "Crear cuenta gratis" → elegir Email/Password → usar un email falso (ej: `test1@example.com`)
3. Completar el wizard de onboarding (Local, Repartidores, Tarifas, Success)
4. En **Settings → Mis Calderos**, debería mostrar **10 calderos** (free grant desde `createAccountWithFreeTier`)
5. Ir a la calculadora, escribir una dirección, elegir courier, click **Calcular**
6. Verificar en el Emulator UI (`http://127.0.0.1:4000`) → Firestore:
   - `accounts/{uid}.creditsBalance` decrementó a 9
   - Nueva `transactions/{txId}` con `type: 'deduction'`, `amount: -1`
7. Calcular 9 veces más → saldo 0
8. Calcular una vez más → error "No te quedan calderos. Comprá más para seguir calculando."

## Paso 6 — Probar idempotencia

En la consola del browser (F12):

```js
// (necesita estar autenticado — la sesión ya está abierta)
const { spendCaldero } = await import('/src/services/calderoService.js');
const key = 'test-idem-' + Math.random();
const a = await spendCaldero(key);
const b = await spendCaldero(key);
console.log(a.transactionId === b.transactionId, a.balanceAfter, b.balanceAfter);
// → true 8 8  (mismo txId, mismo balanceAfter, no se debitó 2 veces)
```

## Paso 7 — Probar el script de migración retroactiva

```powershell
# Dry-run (no escribe)
$env:FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"
$env:FIRESTORE_EMULATOR_HOST = "localhost:8080"
$env:GOOGLE_CLOUD_PROJECT = "demo-caldero-envio"
node functions/scripts/migrate-legacy-users.js
```

Debería listar todos los usuarios Auth del emulador y mostrar el dry-run de la migración. Como ya creaste el `test1@example.com` y recibió free grant, este usuario **ya tiene cuenta** y va a aparecer como `skipped`. Para probar la migración propiamente:

1. En la UI del emulador (`http://127.0.0.1:4000`) → Authentication → Add user → crear `legacy1@example.com` y `legacy2@example.com` (sin pasar por la app). NO tendrán `accounts/{uid}`.
2. Re-correr el script — debería mostrarlos como `would-migrate`.
3. Confirmar el output y correr con `--execute`:

```powershell
node functions/scripts/migrate-legacy-users.js --execute
```

4. Verificar en el emulador: ambos usuarios ahora tienen `accounts/{legacy1}`.creditsBalance = 50 y una transacción `free` con `metadata.source = 'migration-3.5'`.

## Paso 8 — Cleanup

Cuando termines, podés parar el emulador con `Ctrl+C` en su terminal. Para empezar de cero la próxima vez:

```powershell
firebase emulators:start --only ... --import ./emulator-data --export-on-exit ./emulator-data
```

(o simplemente dejá que se pierdan los datos en el emulator — son solo de testing).

## Checklist de criterios de éxito

- [ ] `spendCalderoHandler` 8 tests pasan contra emulador (no skipean)
- [ ] Signup en la UI recibe 10 calderos visibles
- [ ] Calcular descuenta -1 del saldo y registra transacción
- [ ] 11° cálculo tira "Sin calderos"
- [ ] Idempotencia funciona (2 calls con mismo key = 1 débito)
- [ ] Dry-run del script lista 2 usuarios legacy correctamente
- [ ] `--execute` migra a los 2 usuarios legacy con 50 calderos c/u
- [ ] Smoke test visual: el saldo se actualiza en tiempo real en la UI

---

## Troubleshooting

**El emulador no arranca**: verificar Java con `java -version`. El emulador requiere Java 11+.

**Tests skipean**: el emulador no está en `localhost:8080`. Re-arrancarlo en otra terminal.

**"Cannot connect to Firebase emulator" en el browser**: verificar que `VITE_USE_FIREBASE_EMULATORS=true` en `.env.local` y reiniciar `npm run dev`.

**CORS errors en el browser**: el frontend está apuntando a prod. Verificar `.env.local` y reiniciar Vite.

**`spendCaldero` tira "NOT FOUND" en el emulador**: la CF no está siendo servida. Verificar que las CFs se hayan cargado en el startup del emulador (debería decir "Loaded functions: ..., spendCaldero, ...").

**Las CFs de MP no funcionan en el emulador**: el emulador usa el modo mock por default (no hay `MP_ACCESS_TOKEN`). Si necesitás MP real, setear con `firebase functions:secrets:set MP_ACCESS_TOKEN` o simular con el flag `MP_USE_MOCK=true`.
