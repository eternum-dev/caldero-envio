# Plan de pruebas E2E de compra de calderos

> Este documento describe cómo validar el flujo completo de compra de calderos tanto en **modo mock** (sin credenciales de MercadoPago) como en **sandbox real** de MercadoPago.
>
> Objetivo: asegurar que el usuario puede comprar calderos, que se acreditan en tiempo real, que no hay doble acreditación y que el flujo de rescate funciona.

## Prerrequisitos

### Para ambos modos

- [ ] Repo clonado y dependencias instaladas (`npm install` en raíz y `cd functions && npm install`).
- [ ] Firebase CLI autenticado (`firebase login`).
- [ ] Proyecto Firebase seleccionado o usando emuladores locales.
- [ ] Variables de entorno no forzan modo mock si se quiere sandbox real (ver `MP_USE_MOCK`).
- [ ] User de prueba listo (puede ser una cuenta de email/password de prueba).

### Modo mock

- [ ] Emuladores corriendo:
  ```bash
  firebase emulators:start --only firestore,auth,functions
  ```
- [ ] Frontend apuntando a emuladores (`VITE_USE_EMULATORS=true` o similar según configuración local).
- [ ] No se requieren credenciales MP.

### Modo sandbox real

- [ ] Credenciales MP sandbox obtenidas y secrets seteados (ver `docs/MP_SANDBOX_TESTING.md`).
- [ ] Cloud Functions deployadas a staging:
  ```bash
  firebase deploy --only functions --project <staging-project-id>
  ```
- [ ] Firestore rules e indexes deployados:
  ```bash
  firebase deploy --only firestore:rules,firestore:indexes --project <staging-project-id>
  ```
- [ ] Frontend deployado a staging o corriendo localmente apuntando a staging.
- [ ] Webhook URL configurado en panel MP sandbox.

## Flujo mock mode

> Este modo usa `MockMercadoPagoClient` en las Cloud Functions. No hay redirección externa; se muestra un modal simulado de checkout.

1. **Arrancar emuladores**:
   ```bash
   firebase emulators:start --only firestore,auth,functions
   ```

2. **Iniciar frontend**:
   ```bash
   npm run dev
   ```

3. **Login con user de prueba**:
   - Registra una cuenta nueva.
   - Verifica que el badge muestre **10 calderos**.
   - Verifica que en Firestore Emulator UI existan `users/{uid}`, `accounts/{uid}` y `transactions/{txId}` tipo `free`.

4. **Comprar paquete Mini**:
   - Navega a **Configuración > Mis Calderos**.
   - Haz click en **Comprar** del paquete **Mini (150 calderos / $4.990)**.
   - Se abre el modal de simulación de checkout.
   - Haz click en **Aprobar pago**.

5. **Verificar acreditación**:
   - [ ] El modal muestra **"Compra acreditada"**.
   - [ ] El badge de calderos sube a **160**.
   - [ ] El historial muestra una transacción `topup` de **150 calderos**.
   - [ ] En Firestore Emulator UI:
     - `accounts/{uid}.creditsBalance` = 160
     - `accounts/{uid}.lifetimeCredits` = 160
     - `accounts/{uid}.totalTopUps` = 1
     - `accounts/{uid}.pendingPurchaseId` = null
     - `pending_purchases/{purchaseId}.status` = `credited`
     - `transactions/{txId}.type` = `topup`, `externalReference` coincide.

6. **Rescue flow (webhook perdido)**:
   - Compra otro paquete (p. ej. **Standard**).
   - En el modal mock, **no apruebes ni rechaces**; cierra el modal (simula que el webhook se perdió).
   - Refresca la página con el parámetro `purchase_id` de la compra pendiente, o llama manualmente `checkPurchaseStatus` desde la consola del navegador/frontend.
   - Aprueba en el modal de rescate.
   - [ ] Verifica que el saldo suba correctamente y solo una vez.
   - [ ] Verifica que `pending_purchases/{purchaseId}.status` = `credited`.

## Flujo sandbox real

> Este modo usa el SDK real de MercadoPago con credenciales sandbox. El usuario es redirigido al checkout de MP.

1. **Deploy a staging**:
   ```bash
   firebase deploy --only functions,firestore --project <staging-project-id>
   ```

2. **Configurar webhook**:
   - En el panel MP sandbox, configura:
     ```
     https://southamerica-west1-<staging-project-id>.cloudfunctions.net/handlePaymentWebhook
     ```
   - Selecciona evento `payment`.

3. **Login**:
   - Abre el frontend de staging.
   - Crea una cuenta de prueba o usa una existente.
   - Confirma saldo inicial de **10 calderos**.

4. **Comprar paquete Mini**:
   - Ve a **Configuración > Mis Calderos**.
   - Selecciona **Mini (150 calderos / $4.990)**.
   - Se redirige al checkout de MercadoPago sandbox.
   - Paga con una tarjeta de prueba aprobada (ver `docs/MP_SANDBOX_TESTING.md`).
   - Al finalizar, MP redirige de vuelta a la app.

5. **Verificar acreditación**:
   - [ ] Modal muestra **"Compra acreditada"**.
   - [ ] Badge sube a **160 calderos**.
   - [ ] Historial muestra transacción `topup` de 150 calderos.
   - [ ] Firestore:
     - `accounts/{uid}.creditsBalance` = 160
     - `accounts/{uid}.totalTopUps` = 1
     - `pending_purchases/{purchaseId}.status` = `credited`
     - `pending_purchases/{purchaseId}.mpPaymentId` = ID numérico de MP
     - `transactions/{txId}.metadata.mpPaymentId` = ID numérico de MP

6. **Webhook rescue**:
   - Realiza una compra y, antes de que MP notifique, llama manualmente a `checkPurchaseStatus(purchaseId)`.
   - [ ] Si el pago ya está approved en MP, debe acreditar.
   - [ ] Si aún está pending, debe mantener pending.

## Variantes a probar

### Pago rechazado

- En mock mode: selecciona **Rechazar pago**.
- En sandbox: usa tarjeta de prueba rechazada.
- Verifica:
  - [ ] Modal muestra **"Pago rechazado"**.
  - [ ] El saldo no cambia.
  - [ ] Se crea una transacción `payment_failed` con `amount=0`.
  - [ ] `pending_purchases/{purchaseId}.status` = `rejected`.

### Pago pendiente

- En mock mode: selecciona **Dejar pendiente**.
- En sandbox: usa pago en efectivo.
- Verifica:
  - [ ] Modal muestra **"Pago en proceso"**.
  - [ ] El saldo no cambia.
  - [ ] `pending_purchases/{purchaseId}.status` = `pending`.

### Doble click / doble webhook

- En mock mode: abre dos modales o invoca `checkPurchaseStatus` dos veces rápidamente con `mockAction='approved'`.
- En sandbox: espera que MP envíe el webhook más de una vez.
- Verifica:
  - [ ] El saldo solo aumenta una vez.
  - [ ] Solo existe una transacción `topup` para ese `externalReference`.

### Webhook perdido

- Simula que el webhook no llega (por ejemplo, matando la función temporalmente o desconfigurando la URL).
- Usa `checkPurchaseStatus` manualmente.
- Verifica:
  - [ ] El rescue acredita los calderos si el pago está approved.
  - [ ] No se duplica la transacción si luego llega el webhook.

## Bitácora de resultados

Cada ejecución de E2E debe dejar registro en `docs/sessions/sesion-N-e2e-bitacora.md` (o archivo equivalente) con esta estructura:

```markdown
## E2E <modo> — <fecha>

### Setup
- Commit/branch:
- Emuladores/deploy:
- User de prueba:

### Escenarios

| # | Escenario | Pasos | Esperado | Resultado | Timestamp |
|---|-----------|-------|----------|-----------|-----------|
| 1 | Compra Mini aprobada | ... | Saldo 160 | PASS/FAIL | ... |
| 2 | Pago rechazado | ... | Sin cambio | PASS/FAIL | ... |
| 3 | Pago pendiente | ... | Sin cambio | PASS/FAIL | ... |
| 4 | Doble acreditación | ... | Una sola tx | PASS/FAIL | ... |
| 5 | Rescue webhook perdido | ... | Acredita | PASS/FAIL | ... |

### Issues encontrados
- ...

### Evidencia
- Logs: ...
- Screenshots: ...
```

## Troubleshooting

### El badge no se actualiza

- Revisa que `useCredits` esté suscrito a `accounts/{uid}`.
- Revisa que no haya un error de permisos en `firestore.rules`.

### El modal se queda en "Procesando"

- Revisa los logs de `checkPurchaseStatus`.
- En mock mode, asegúrate de que el modal mock envió `mockAction`.
- En sandbox, asegúrate de que el pago esté approved en MP.

### Error "No pudimos iniciar la compra"

- Revisa los logs de `createCheckoutSession`.
- Verifica que la cuenta exista (`accounts/{uid}`).
- En sandbox, verifica `MP_ACCESS_TOKEN`.

### Doble acreditación

- Revisa que no haya dos `transactions` con mismo `externalReference` y `type='topup'`.
- Si existe, reporta como bug crítico.

### Webhook no llega

- Verifica la URL configurada en panel MP.
- Verifica `MP_WEBHOOK_SECRET`.
- Verifica que `handlePaymentWebhook` esté deployada y pública.

## Rollback

Si algo falla gravemente en producción o staging:

1. **Deshabilitar compras**: comenta o deshabilita la exportación de `createCheckoutSession` en `functions/index.js` y redeploya.
2. **Revertir saldos**: manualmente corrige `accounts/{uid}` y elimina transacciones duplicadas solo si estás seguro.
3. **Revertir commit**:
   ```bash
   git revert <commit-sha>
   git push
   ```
4. **Redeploy**:
   ```bash
   firebase deploy --only functions,firestore,hosting --project <project-id>
   ```
5. **Notificar**: deja registro en la bitácora del rollback y crea un issue de bug.

## Referencias

- `docs/MP_SANDBOX_TESTING.md` — credenciales sandbox, webhook, tarjetas de prueba.
- `docs/CALDEROS_FREE_GRANT_TEST.md` — verificación del free grant inicial.
- `docs/CALDEROS_UI_E2E.md` — validación de UI sin MercadoPago.
