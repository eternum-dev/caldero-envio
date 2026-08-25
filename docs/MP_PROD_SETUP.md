# Guía de setup de MercadoPago en producción

> Esta guía documenta cómo pasar el módulo de calderos desde el ambiente sandbox de MercadoPago a producción, manteniendo los valores y decisiones LOCKED del playbook (#366).
>
> **NO commitear credenciales.** Los tokens y secrets van únicamente a Firebase Secrets via CLI.

## Diferencias clave sandbox vs producción

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| Access token | `APP_USR-...` (sandbox) | Token de producción de la cuenta MP del negocio |
| Webhook secret | Generado en panel sandbox | Generado en panel producción (o vía CLI) |
| Dinero real | No | Sí |
| Tarjetas de prueba | `4509 9535 6623 3704`, etc. | Tarjetas reales de usuarios |
| URL webhook | `https://southamerica-east1-caldero-envio.cloudfunctions.net/handlePaymentWebhook` | `https://southamerica-east1-caldero-envio.cloudfunctions.net/handlePaymentWebhook` |
| `back_urls` del checkout | Preview channel o `localhost` | `https://caldero-envio.web.app` |
| Reembolso de prueba | No aplica | Sí, vía panel MP |
| Cloud Functions gen | 2nd gen (Cloud Run) | 2nd gen (Cloud Run) |
| Runtime | Node 22 | Node 22 |
| Región | `southamerica-east1` | `southamerica-east1` (irreversible) |

## Prerrequisitos

1. Tener acceso como owner/editor al proyecto Firebase `caldero-envio`.
2. Tener acceso como admin a la cuenta de MercadoPago del negocio.
3. Contar con credenciales de producción:
   - Access token de producción de MercadoPago.
   - Webhook secret de producción (se provee por canal seguro).
4. Las Cloud Functions de calderos ya deployadas y probadas en sandbox (Sesión 4, T-F.1 a T-F.6).
5. `firebase-tools` v13 disponible (se usa `npx firebase-tools@13` o el binario local).
6. Leer y entender los cambios de la Sesión 5 descritos más abajo.

## Sesión 5: cambios de la migración a 2nd gen

La Sesión 5 (PR #11, merge `a773e2b`) migró las Cloud Functions de 1st gen a 2nd gen (Cloud Run). Esto impacta directamente el setup de producción:

- **URL pattern**: las funciones ahora responden en `https://southamerica-east1-caldero-envio.cloudfunctions.net/<name>`, **no** en `*.run.app`. El webhook de producción es:

  ```
  https://southamerica-east1-caldero-envio.cloudfunctions.net/handlePaymentWebhook
  ```

- **CORS**: la configuración de orígenes permitidos se movió al wrapper `onCall({ cors: [...] })` de cada función. No se configura a nivel global ni en `firebase.json`.

- **Región**: todas las funciones nuevas se deployan en `southamerica-east1`, donde ya está App Engine. **La región es irreversible** para las funciones 2nd gen.

- **Runtime**: `firebase-functions` v5+ con runtime Node 22 (no Node 20).

## Bug crítico descubierto en Sesión 5 (y su fix)

**Síntoma**: en producción (2nd gen) las funciones fallaban con:

```
FirebaseAppError: The default Firebase app does not exist
```

**Causa raíz**: el runtime de 1st gen auto-inicializa el Admin SDK, pero **2nd gen (Cloud Run) NO lo hace**. El archivo `functions/admin.js` solo llamaba `admin.initializeApp()` bajo condición de emulador.

**Fix aplicado** en `functions/admin.js`:

```js
if (admin.apps.length === 0) {
  admin.initializeApp();
}
```

Esto garantiza inicialización manual en 2nd gen sin romper el emulador. Commit del fix: `4eddac8`.

## Quirks de deploy con firebase-tools@13

Durante la Sesión 5 se encontraron comportamientos específicos de `firebase-tools@13` al deployar funciones 2nd gen:

1. **Variable de entorno `GOOGLE_CLOUD_REGION`**: debe estar seteada a `southamerica-east1` **antes** de correr cualquier comando de deploy:

   ```powershell
   $env:GOOGLE_CLOUD_REGION = "southamerica-east1"
   ```

2. **Filtro `--only functions:<name>` no funciona**. Para funciones 2nd gen se debe usar:

   ```bash
   firebase deploy --only functions:default:<name>
   ```

3. **Deploy múltiple con comas silenciosamente salta funciones**. Deployar una por una:

   ```bash
   firebase deploy --only functions:default:createCheckoutSession
   firebase deploy --only functions:default:handlePaymentWebhook
   firebase deploy --only functions:default:checkPurchaseStatus
   ```

4. **`--only functions` (sin filtro) hace timeout** al intentar cargar todas las funciones, incluyendo las 1st gen de mapbox que aún existen.

5. **Las Cloud Functions de mapbox (1st gen) deben quedar intactas** en esta migración. No deployarlas ni borrarlas.

## CORS regex ampliado en Sesión 5

El regex de orígenes permitidos para preview channels fue ampliado:

- **Antes**: `^https:\/\/caldero-envio--calderos-preview-.*\.web\.app$/`
- **Ahora**: `^https:\/\/caldero-envio--calderos-.*\.web\.app$/`

Esto permite cualquier preview channel bajo `calderos-*`. Si en el futuro se configura un dominio custom, agregarlo explícitamente a `CORS_ALLOWED_ORIGINS` en cada Cloud Function.

## 🚀 T-F.7 → T-F.10: Prod launch checklist

### T-F.7: Swap secrets a producción (entre semana, sin deploy)

- [ ] Set prod `MP_ACCESS_TOKEN`:
  ```bash
  firebase functions:secrets:set MP_ACCESS_TOKEN --project caldero-envio
  # Pegar el token de prod de la cuenta real de MercadoPago
  ```
- [ ] Set prod `MP_WEBHOOK_SECRET` (value provided by Ale):
  ```bash
  firebase functions:secrets:set MP_WEBHOOK_SECRET --project caldero-envio
  # Pegar el secret generado
  ```
- [ ] Verify secrets are set:
  ```bash
  firebase functions:secrets:access MP_ACCESS_TOKEN --project caldero-envio
  firebase functions:secrets:access MP_WEBHOOK_SECRET --project caldero-envio
  ```
- [ ] Re-deploy only the 3 CFs that need the secret (NOT main hosting):
  ```powershell
  $env:GOOGLE_CLOUD_REGION = "southamerica-east1"
  $env:PATH = "C:\Users\aleja\AppData\Local\Temp\opencode\firebase-tools-13\node_modules\.bin;$env:PATH"
  firebase deploy --only functions:default:createCheckoutSession --project caldero-envio
  firebase deploy --only functions:default:handlePaymentWebhook --project caldero-envio
  firebase deploy --only functions:default:checkPurchaseStatus --project caldero-envio
  ```

### T-F.8: Deploy final a producción (ventana de mantenimiento)

- [ ] Avisar a clientes de mantenimiento breve
- [ ] Deploy hosting (frontend):
  ```bash
  npm run build
  firebase deploy --only hosting --project caldero-envio
  ```
- [ ] Verify hosting: https://caldero-envio.web.app loads OK

### T-F.9: Configurar webhook URL en MP producción

- [ ] Go to https://www.mercadopago.com.ar/ipn-notifications/webhooks (or equivalent for Chile)
- [ ] Set URL: `https://southamerica-east1-caldero-envio.cloudfunctions.net/handlePaymentWebhook`
- [ ] Test webhook → expect 200 OK

### T-F.10: Smoke test 1 compra real

- [ ] Create test user (or use existing real one)
- [ ] Buy Mini package ($4.990 CLP) with real card
- [ ] Verify: saldo actualizado, transacción topup en historial, totalTopUps=1
- [ ] Reembolsar la compra de prueba
- [ ] Documentar resultado en `docs/CALDEROS_PROD_LAUNCH.md` (crear si no existe)

## Rollback si algo falla

Si el smoke test de producción falla:

```powershell
# Opción A: eliminar solo las funciones 2nd gen de calderos
firebase functions:delete default:createCheckoutSession default:handlePaymentWebhook default:checkPurchaseStatus --project caldero-envio

# Opción B: revertir secrets a sandbox y redeployar funciones 2nd gen
firebase functions:secrets:set MP_ACCESS_TOKEN --project caldero-envio
firebase functions:secrets:set MP_WEBHOOK_SECRET --project caldero-envio
$env:GOOGLE_CLOUD_REGION = "southamerica-east1"
firebase deploy --only functions:default:createCheckoutSession --project caldero-envio
firebase deploy --only functions:default:handlePaymentWebhook --project caldero-envio
firebase deploy --only functions:default:checkPurchaseStatus --project caldero-envio
```

> **No tocar las funciones 1st gen de mapbox** durante el rollback.

## Referencias

- `docs/MP_SANDBOX_TESTING.md` — guía de sandbox.
- Playbook #366 (`sdd/revisar-monetizacion/playbook`) — decisiones LOCKED.
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env?hl=es-419#secret_parameters)
- [MercadoPago Webhooks docs](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
