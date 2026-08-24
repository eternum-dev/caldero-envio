const { nanoid } = require('nanoid');

/**
 * MercadoPago client factory + mock implementation.
 *
 * Real SDK API surface (v3.2.0) used by this wrapper:
 *   - new MercadoPagoConfig({ accessToken, options: { timeout } })
 *   - new Preference(client).create({ body: { items, external_reference, back_urls, auto_return, notification_url } })
 *   - new Payment(client).get({ id })
 *   - WebhookSignatureValidator.validate({ xSignature, xRequestId, dataId, secret })
 *
 * Swap path to real MP sandbox:
 *   1. Set secrets via Firebase CLI:
 *      firebase functions:secrets:set MP_ACCESS_TOKEN
 *      firebase functions:secrets:set MP_WEBHOOK_SECRET
 *   2. Set MP_USE_MOCK=false (or unset it) and MP_APP_URL to your hosting URL.
 *   3. Redeploy functions.
 *   4. The factory will automatically import the real 'mercadopago' SDK and
 *      use HMAC signature validation.
 */

const MOCK_SIGNATURE = 'mock-signature-accepted';
const MOCK_REQUEST_ID = 'mock-request-id';

// Singleton client promise. We don't construct the SDK (real or mock)
// at module load because:
// 1. firebase-functions is required at top of file, but the SDK needs
//    it to be initialized (for admin SDK) before use.
// 2. The MP SDK (real) does a dynamic import() that we want lazy.
// 3. The mock client holds in-memory state (a Map) — we want one shared
//    instance per cold start, not one per call.
// First call to getMercadoPagoClient() resolves the promise; subsequent
// calls return the same promise.
let clientPromise = null;

// Token resolution priority (in order):
//  1. process.env.MP_ACCESS_TOKEN    → set by 2nd gen Cloud Run runtime
//                                    (when deployed with --set-secrets)
//  2. functions.config()            → set by 1st gen firebase-tools@11
//                                    (firebase functions:config:set)
//  3. none found                    → fall back to mock mode
// We do NOT hardcode the token. Even though it lived in git history
// during early dev, the current code reads only from runtime config.
// The hardcoded value was removed in commit 8f7bd4b.
function shouldUseMock() {
  return process.env.MP_USE_MOCK === 'true' || !getAccessToken();
}

function getAccessToken() {
  return process.env.MP_ACCESS_TOKEN
    || (() => {
      try {
        return require('firebase-functions').config().mercadopago?.access_token;
      } catch (e) {
        return null;
      }
    })();
}

function createMockClient() {
  // In-memory payment status registry for the mock client.
  // This is enough for local emulator tests and manual mock E2E; Cloud Functions
  // in production are stateless, so this code path is only active in mock mode.
  // The Map is shared across all invocations within the same Cloud Function
  // instance, but each cold start creates a new one. For mock testing this
  // is fine because the test (or the user via the mock modal) does both
  // setStatus and getStatus in the same request lifecycle.
  const payments = new Map();

  const setPaymentStatus = (externalReference, status, amount = 0) => {
    const statusDetail =
      status === 'approved'
        ? 'accredited'
        : status === 'rejected'
          ? 'rejected'
          : status === 'cancelled'
            ? 'cancelled'
            : 'pending_waiting_payment';

    payments.set(externalReference, {
      status,
      statusDetail,
      amount,
      externalReference,
    });
  };

  return {
    preference: {
      create: async ({ body }) => {
        const preferenceId = `MOCK_PREF_${nanoid(12)}`;
        // The init_point URL contains "mock.mercadopago.com" which the
        // frontend detects via isMockCheckoutUrl() to show the MockCheckoutModal
        // instead of redirecting. NEVER change this to a real-looking URL
        // without updating the frontend's mock detection.
        const initPoint = `https://mock.mercadopago.com/checkout?pid=${preferenceId}`;

        return {
          id: preferenceId,
          init_point: initPoint,
          sandbox_init_point: initPoint,
          external_reference: body.external_reference,
          items: body.items,
        };
      },
    },

    payment: {
      get: async ({ id }) => {
        const key = String(id);
        // Support either a payment id or the external reference as the lookup key.
        const found = payments.get(key) || payments.get(key.replace(/^mock-payment-/, ''));

        if (found) {
          return {
            id: key.startsWith('mock-payment-') ? key : `mock-payment-${key}`,
            status: found.status,
            status_detail: found.statusDetail,
            external_reference: found.externalReference,
            transaction_amount: found.amount,
            currency_id: 'CLP',
          };
        }

        // Default fallback for unknown mock payments: pending.
        return {
          id: key.startsWith('mock-payment-') ? key : `mock-payment-${key}`,
          status: 'pending',
          status_detail: 'pending_waiting_payment',
          external_reference: key.replace(/^mock-payment-/, ''),
          transaction_amount: 0,
          currency_id: 'CLP',
        };
      },
    },

    verifyWebhookSignature: ({ xSignature }) => {
      if (xSignature === MOCK_SIGNATURE) {
        return;
      }
      throw new Error('Invalid mock signature');
    },

    _mock: {
      signature: MOCK_SIGNATURE,
      requestId: MOCK_REQUEST_ID,
      setPaymentStatus,
      getPaymentStatus: (externalReference) => payments.get(externalReference),
    },
  };
}

async function createRealClient() {
  // The official SDK is ESM-only in v3.2.0; use dynamic import from CJS.
  const mp = await import('mercadopago');

  const client = new mp.MercadoPagoConfig({
    accessToken: getAccessToken(),
    options: { timeout: 5000 },
  });

  return {
    preference: new mp.Preference(client),
    payment: new mp.Payment(client),
    verifyWebhookSignature: ({ xSignature, xRequestId, dataId, secret }) => {
      mp.WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret,
      });
    },
  };
}

async function getMercadoPagoClient() {
  if (!clientPromise) {
    clientPromise = shouldUseMock() ? Promise.resolve(createMockClient()) : createRealClient();
  }
  return clientPromise;
}

function resetMercadoPagoClient() {
  clientPromise = null;
}

module.exports = {
  getMercadoPagoClient,
  resetMercadoPagoClient,
  MOCK_SIGNATURE,
  MOCK_REQUEST_ID,
};
