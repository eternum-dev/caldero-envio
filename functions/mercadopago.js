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

// TEMPORAL: Token hardcodeado para destrabar testing del checkout real.
// En Sesion 5+ migramos a firebase-functions v5+ con secrets nativos (2nd gen / Cloud Run).
const MP_ACCESS_TOKEN_HARDCODED = 'APP_USR-3448017533050489-080713-92f8dc2cd21d52aa9fc5e2cfef426bc0-3599557536';

let clientPromise = null;

function shouldUseMock() {
  return process.env.MP_USE_MOCK === 'true' || !MP_ACCESS_TOKEN_HARDCODED;
}

function getAccessToken() {
  return MP_ACCESS_TOKEN_HARDCODED;
}

function createMockClient() {
  // In-memory payment status registry for the mock client.
  // This is enough for local emulator tests and manual mock E2E; Cloud Functions
  // in production are stateless, so this code path is only active in mock mode.
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
