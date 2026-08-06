# Guía de testing sandbox de MercadoPago

> Esta guía permite probar el flujo real de compra de calderos con credenciales sandbox de MercadoPago sin mover dinero real.
>
> Ambiente objetivo: Firebase project de staging, región `southamerica-west1`, Cloud Functions de calderos ya deployadas.

## Prerrequisitos

1. Tener acceso como admin al proyecto Firebase de staging.
2. Tener instalado y autenticado Firebase CLI (`firebase login`).
3. Tener acceso a una cuenta de MercadoPago con permisos de desarrollador.
4. Tener deployadas las Cloud Functions de calderos (`createCheckoutSession`, `handlePaymentWebhook`, `checkPurchaseStatus`).
5. Haber deployado `firestore.rules` e `firestore.indexes.json`.

## 1. Obtener credenciales sandbox

1. Ingresa al [Dashboard de MercadoPago](https://www.mercadopago.com/developers/panel) con la cuenta del negocio.
2. Ve a **Tu aplicación > Credenciales de producción** y cambia al ambiente **Sandbox**.
3. Copia:
   - **Access Token** (largo, comienza con `TEST-...`). Será `MP_ACCESS_TOKEN`.
   - **Public Key** de sandbox (solo si quieres probar Checkout Pro desde el frontend; las CF lo usan indirectamente).
4. Ve a **Notificaciones > Webhooks** y copia el **Secret** configurado para el webhook, o genera uno nuevo. Será `MP_WEBHOOK_SECRET`.

## 2. Setear secrets en Firebase

Desde la raíz del repo, ejecuta los siguientes comandos reemplazando los valores:

```bash
firebase functions:secrets:set MP_ACCESS_TOKEN --project <staging-project-id>
# Pega el Access Token de sandbox cuando se solicite.

firebase functions:secrets:set MP_WEBHOOK_SECRET --project <staging-project-id>
# Pega el Webhook Secret cuando se solicite.
```

> Los secrets tardan unos minutos en replicarse. Espera a que el deploy siguiente los monte en las instancias.

## 3. Configurar variables de entorno de la función

Asegúrate de que las funciones no estén forzando modo mock. En producción/staging el factory de `functions/mercadopago.js` usa el cliente real cuando `MP_ACCESS_TOKEN` está presente y `MP_USE_MOCK` no es `true`.

No es necesario setear `MP_USE_MOCK` en staging; déjalo sin definir.

Opcionalmente configura `MP_APP_URL` para que `back_urls` apunten al hosting de staging:

```bash
firebase functions:config:set mp.app_url="https://staging.caldero-envio.web.app" --project <staging-project-id>
```

> Si usas secrets en vez de config, ajusta `createCheckoutSession.js` para leer `process.env.MP_APP_URL` o un default razonable.

## 4. Deploy de functions a staging

```bash
firebase deploy --only functions --project <staging-project-id>
```

Verifica que las funciones aparezcan en la región `southamerica-west1`:

- `createCheckoutSession`
- `handlePaymentWebhook`
- `checkPurchaseStatus`
- `createAccountWithFreeTier`

## 5. Configurar webhook URL en el panel de MercadoPago

La URL del webhook debe apuntar a la Cloud Function `handlePaymentWebhook`. Elige la correcta según el ambiente:

```
https://southamerica-west1-<staging-project-id>.cloudfunctions.net/handlePaymentWebhook
```

En el panel de MercadoPago:

1. Ve a **Notificaciones > Webhooks**.
2. Agrega la URL anterior.
3. Selecciona el evento `payment`.
4. Guarda y copia el **Secret** que te entrega MP.
5. Asegúrate de que ese mismo valor esté en el secret `MP_WEBHOOK_SECRET` de Firebase.

## 6. Test cards

Usa estos datos en el checkout sandbox:

| Número              | CVV | Fecha vencimiento | Resultado esperado |
|---------------------|-----|-------------------|--------------------|
| `4509 9535 6623 3704` | `123` | `11/30`           | Aprobado (`accredited`) |
| `4013 5406 8274 7120` | `123` | `11/30`           | Rechazado (`rejected`) |
| `5186 1739 4454 4890` | `123` | `11/30`           | Aprobado (`accredited`) |
| `3700 0000 0000 002`  | `1234`| `11/30`           | Aprobado (`accredited`) |

Para pagos pendientes usa el botón de **Pago en efectivo** del checkout sandbox.

## 7. Probar el flujo E2E

1. Abre el frontend de staging y crea una cuenta de prueba.
2. Verifica que el saldo inicial sea **10 calderos**.
3. Ve a **Configuración > Mis Calderos**.
4. Selecciona el paquete **Mini (150 calderos / $4.990)**.
5. Completa el pago en el checkout sandbox con una tarjeta aprobada.
6. Al volver a la app, el modal debe mostrar **"Compra acreditada"** y el saldo debe ser **160 calderos**.
7. Verifica en Firestore:
   - `accounts/{uid}`: `creditsBalance=160`, `lifetimeCredits=160`, `totalTopUps=1`, `pendingPurchaseId=null`.
   - `transactions/{txId}`: `type='topup'`, `amount=150`, `balanceAfter=160`, `externalReference` coincide con la compra.
   - `pending_purchases/{purchaseId}`: `status='credited'`, `mpPaymentId` registrado.

## 8. Ejemplos con curl

### 8.1 Invocar `createCheckoutSession` directamente

Necesitas un token ID de Firebase Auth válido. Reemplaza `<id_token>`:

```bash
curl -X POST \
  https://southamerica-west1-<staging-project-id>.cloudfunctions.net/createCheckoutSession \
  -H "Content-Type: application/json" \
  -d '{
    "data": { "packageId": "mini" }
  }'
```

En emuladores (sin autenticación de CF) se puede invocar el handler directamente; en producción/staging la CF requiere `Authorization: Bearer <id_token>`.

### 8.2 Simular un webhook de MercadoPago

Si quieres probar el webhook sin pasar por el checkout, genera la firma HMAC válida. El helper `verifyWebhookSignature` del SDK espera:

- Header `x-signature`: `ts=<timestamp>,v1=<hmac_hex>`
- Header `x-request-id`: un UUID
- Query `data.id` o body `data.id`
- Body JSON con `type`, `action` y `data.id`

Ejemplo de generación de firma local (Node.js):

```js
const crypto = require('crypto');

const secret = 'tu-webhook-secret';
const dataId = '1234567890';
const timestamp = Math.floor(Date.now() / 1000);
const template = `id:${dataId};request-id:req-123;ts:${timestamp};`;
const signature = crypto.createHmac('sha256', secret).update(template).digest('hex');
console.log(`ts=${timestamp},v1=${signature}`);
```

Luego envía:

```bash
curl -X POST \
  "https://southamerica-west1-<staging-project-id>.cloudfunctions.net/handlePaymentWebhook?data.id=1234567890" \
  -H "x-signature: ts=<timestamp>,v1=<signature>" \
  -H "x-request-id: req-123" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.created",
    "data": { "id": "1234567890" }
  }'
```

> Para una compra real, `data.id` es el `payment.id` numérico que MercadoPago asigna. El handler llama a `mp.payment.get({ id })` para obtener `external_reference` y acreditar.

## 9. Troubleshooting

### El webhook retorna 401

- Verifica que `MP_WEBHOOK_SECRET` en Firebase sea exactamente igual al secret del panel de MP.
- Revisa que el formato de `x-signature` sea `ts=<ts>,v1=<hmac>`.
- Asegúrate de que `data.id` esté presente en query o body.

### El checkout sandbox no redirige de vuelta

- Verifica `back_urls` en `createCheckoutSession.js`; en producción deben apuntar al hosting real.
- Revisa `MP_APP_URL` o el default del código.

### La compra queda en "pending" para siempre

- Confirma que el webhook esté configurado en MP y que la URL sea accesible pública.
- Revisa los logs de `handlePaymentWebhook` en Firebase Console.
- Usa `checkPurchaseStatus` manualmente para rescatar el pago.

### Doble acreditación

No debería ocurrir: `creditPurchase` usa `runTransaction` e idempotencia por `externalReference`. Si ocurre, revisa que no haya dos `transactions` con el mismo `externalReference` y `type='topup'`.

### Error `No pudimos iniciar la compra`

- Revisa los logs de `createCheckoutSession`.
- Verifica que `MP_ACCESS_TOKEN` esté seteado como secret y que el deploy haya terminado.
- Si la cuenta no existe, `createAccountWithFreeTier` debe haber corrido primero.

## 10. Swap a producción

1. Genera un nuevo `MP_WEBHOOK_SECRET` en el panel de MP producción.
2. Setea los secrets de producción:
   ```bash
   firebase functions:secrets:set MP_ACCESS_TOKEN --project <prod-project-id>
   firebase functions:secrets:set MP_WEBHOOK_SECRET --project <prod-project-id>
   ```
3. Configura `MP_APP_URL` con la URL de hosting producción.
4. Deploy:
   ```bash
   firebase deploy --only functions,firestore,hosting --project <prod-project-id>
   ```
5. Configura el webhook en el panel de MP producción con:
   ```
   https://southamerica-west1-<prod-project-id>.cloudfunctions.net/handlePaymentWebhook
   ```
6. Realiza una compra de prueba con una tarjeta real (se reembolsa después).

### Diferencias clave sandbox vs producción

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| Access token | `TEST-...` | Token de producción |
| Dinero real | No | Sí |
| Webhook URL | staging | producción |
| Tarjetas | De prueba | Reales |
| Reembolso | No aplica | Sí, vía panel MP |

## Referencias

- [MercadoPago Checkout Pro docs](https://www.mercadopago.com/developers/es/docs/checkout-pro/landing)
- [MercadoPago Webhooks docs](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env?hl=es-419#secret_parameters)
