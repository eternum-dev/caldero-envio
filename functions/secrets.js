const { defineSecret } = require('firebase-functions/params');

/**
 * MercadoPago secrets. The 2nd gen Cloud Functions runtime exposes them as
 * process.env.MP_ACCESS_TOKEN / MP_WEBHOOK_SECRET automatically when the
 * function declares them in `onCall` / `onRequest` via `secrets: [...]`.
 *
 * `defineSecret` returns a SecretParam that must be `value()`-ed at runtime
 * — we don't call .value() here because we want to pass the SecretParam
 * itself into the function options (firebase-functions handles resolution).
 */

const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN');
const MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET');

module.exports = {
  MP_ACCESS_TOKEN,
  MP_WEBHOOK_SECRET,
  MP_SECRETS: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET],
};