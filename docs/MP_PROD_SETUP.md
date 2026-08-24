# Guía de setup de MercadoPago en producción

> Esta guía documenta cómo pasar el módulo de calderos desde el ambiente sandbox de MercadoPago a producción, manteniendo los valores y decisiones LOCKED del playbook (#366).
>
> **NO commitear credenciales.** Los tokens y secrets van únicamente a Firebase Secrets via CLI.

## Diferencias clave sandbox vs producción

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| Access token | `APP_USR-...` (sandbox) | Token de producción de la cuenta MP del negocio |
| Webhook secret | Generado en panel sandbox | Generado en panel producción |
| Dinero real | No | Sí |
| Tarjetas de prueba | `4509 9535 6623 3704`, etc. | Tarjetas reales de usuarios |
| URL webhook | `https://southamerica-west1-caldero-envio.cloudfunctions.net/handlePaymentWebhook` | La misma URL (mismo proyecto Firebase) |
| `back_urls` del checkout | Preview channel o `localhost` | `https://caldero-envio.web.app` |
| Reembolso de prueba | No aplica | Sí, vía panel MP |

## Prerrequisitos

1. Tener acceso como owner/editor al proyecto Firebase `caldero-envio`.
2. Tener acceso como admin a la cuenta de MercadoPago del negocio.
3. Contar con credenciales de producción:
   - Access token de producción de MercadoPago.
   - Webhook secret de producción.
4. Las Cloud Functions de calderos ya deployadas y probadas en sandbox (Sesión 4, T-F.1 a T-F.6).
5. `firebase-tools` v13 disponible (se usa `npx firebase-tools@13` o el binario local).

## 1. Rotar secrets a producción

Desde la raíz del repo, con el proyecto `caldero-envio` activo:

```bash
npx firebase-tools@13 firebase use caldero-envio

npx firebase-tools@13 firebase functions:secrets:set MP_ACCESS_TOKEN --project caldero-envio
# Pegar el Access Token de producción cuando se solicite.

npx firebase-tools@13 firebase functions:secrets:set MP_WEBHOOK_SECRET --project caldero-envio
# Pegar el Webhook Secret de producción cuando se solicite.
```

> Los secrets tardan unos minutos en replicarse. Espera a que el deploy siguiente los monte en las instancias.

## 2. Verificar variables de entorno

Asegúrate de que las funciones no estén forzando modo mock. El factory `functions/mercadopago.js` usa el cliente real cuando `MP_ACCESS_TOKEN` está presente y `MP_USE_MOCK` no es `true`.

No es necesario setear `MP_USE_MOCK` en producción.

Opcionalmente, configura `MP_APP_URL` para que `back_urls` apunten al hosting de producción:

```bash
npx firebase-tools@13 firebase functions:config:set mp.app_url="https://caldero-envio.web.app" --project caldero-envio
```

> Si usas secrets en vez de config, ajusta `createCheckoutSession.js` para leer `process.env.MP_APP_URL` o un default razonable.

## 3. Deploy final a producción

Una vez confirmado que el smoke test sandbox pasó (T-F.6 = PASS):

```bash
npm run build
npx firebase-tools@13 firebase deploy --only functions,firestore,hosting --project caldero-envio
```

Verifica que las siguientes funciones estén visibles en la región `southamerica-west1`:

- `createAccountWithFreeTier`
- `createCheckoutSession`
- `handlePaymentWebhook`
- `checkPurchaseStatus`

## 4. Configurar webhook en panel MP producción

URL del webhook:

```
https://southamerica-west1-caldero-envio.cloudfunctions.net/handlePaymentWebhook
```

Pasos:

1. Ingresa al [Dashboard de MercadoPago](https://www.mercadopago.com/developers/panel).
2. Cambia al ambiente **Producción**.
3. Ve a **Notificaciones > Webhooks**.
4. Agrega la URL anterior.
5. Selecciona el evento `payment`.
6. Guarda y copia el **Secret** que entrega MP.
7. Asegúrate de que ese mismo valor esté en el secret `MP_WEBHOOK_SECRET` de Firebase.

## 5. Smoke test de una compra real

1. Usa una cuenta de usuario real de la app.
2. Ve a **Configuración > Mis Calderos**.
3. Selecciona el paquete **Mini (150 calderos / $4.990)**.
4. Completa el pago con una tarjeta real.
5. Al volver a la app, el modal debe mostrar **"Compra acreditada"** y el saldo debe subir a **160 calderos** (10 gratis + 150 Mini).
6. Verifica en Firestore:
   - `accounts/{uid}`: `creditsBalance=160`, `lifetimeCredits=160`, `totalTopUps=1`, `pendingPurchaseId=null`.
   - `transactions/{txId}`: `type='topup'`, `amount=150`, `balanceAfter=160`, `externalReference` coincide con la compra.
   - `pending_purchases/{purchaseId}`: `status='credited'`, `mpPaymentId` registrado.
7. Reembolsa la compra de prueba desde el panel de MercadoPago.

## 6. Rollback si algo falla

Si el smoke test de producción falla:

```bash
# Opción A: eliminar las funciones de calderos
npx firebase-tools@13 firebase functions:delete createCheckoutSession handlePaymentWebhook checkPurchaseStatus createAccountWithFreeTier --project caldero-envio

# Opción B: revertir secrets a sandbox y redeployar
npx firebase-tools@13 firebase functions:secrets:set MP_ACCESS_TOKEN --project caldero-envio
npx firebase-tools@13 firebase functions:secrets:set MP_WEBHOOK_SECRET --project caldero-envio
npx firebase-tools@13 firebase deploy --only functions --project caldero-envio
```

## Checklist antes de declarar LIVE

- [ ] Secrets de producción seteados en Firebase.
- [ ] Deploy de functions, firestore y hosting exitoso.
- [ ] Webhook configurado en panel MP producción.
- [ ] Smoke test con compra real: PASS.
- [ ] Reembolso de la compra de prueba realizado.
- [ ] No hay doble acreditación en Firestore.
- [ ] Badge de calderos refleja el saldo correcto en tiempo real.

## Referencias

- `docs/MP_SANDBOX_TESTING.md` — guía de sandbox.
- Playbook #366 (`sdd/revisar-monetizacion/playbook`) — decisiones LOCKED.
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env?hl=es-419#secret_parameters)
- [MercadoPago Webhooks docs](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
