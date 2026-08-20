const functions = require('firebase-functions');
const admin = require('../admin');
const { FieldValue } = require('firebase-admin/firestore');
const { nanoid } = require('nanoid');
const { randomUUID } = require('crypto');
const { getMercadoPagoClient } = require('../mercadopago');
const { PACKAGES, CURRENCY } = require('./packages');

const CORS_ALLOWED_ORIGINS = [
  'https://caldero-envio.web.app',
  'https://caldero-envio.firebaseapp.com',
  /^https:\/\/caldero-envio--calderos-preview-.*\.web\.app$/,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Creates a MercadoPago Checkout Pro session for a caldero package.
 *
 * @param {object} data
 * @param {string} data.packageId
 * @param {functions.https.CallableContext} context
 * @returns {Promise<{init_point: string, purchase_id: string, external_reference: string}>}
 */
async function createCheckoutSessionHandler(data, context) {
  if (!context.auth) {
    functions.logger.error('createCheckoutSession: unauthenticated call');
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { packageId } = data || {};
  const pkg = PACKAGES[packageId];
  if (!pkg) {
    functions.logger.error('createCheckoutSession: invalid packageId', { packageId });
    throw new functions.https.HttpsError('invalid-argument', `packageId inválido: ${packageId}`);
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(uid);
  const accountDoc = await accountRef.get();

  if (!accountDoc.exists) {
    functions.logger.error('createCheckoutSession: account not found', { uid });
    throw new functions.https.HttpsError('not-found', 'Cuenta no encontrada');
  }

  const purchaseId = randomUUID();
  const externalReference = `${uid}_${packageId}_${nanoid(12)}`;
  const appUrl = process.env.MP_APP_URL || 'http://localhost:5173';
  const backUrl = `${appUrl}/settings/calderos?purchase_id=${purchaseId}`;

  const projectId =
    process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'caldero-envio';
  const functionsPort = process.env.FUNCTIONS_EMULATOR_PORT || '5001';
  const notificationUrl =
    process.env.MP_WEBHOOK_URL ||
    (process.env.FUNCTIONS_EMULATOR
      ? `http://localhost:${functionsPort}/${projectId}/southamerica-west1/handlePaymentWebhook`
      : `https://southamerica-west1-${projectId}.cloudfunctions.net/handlePaymentWebhook`);

  const mp = await getMercadoPagoClient();

  let preference;
  try {
    preference = await mp.preference.create({
      body: {
        items: [
          {
            id: packageId,
            title: `Paquete ${pkg.name} - ${pkg.calderos} calderos`,
            quantity: 1,
            unit_price: pkg.priceCLP,
            currency_id: CURRENCY,
          },
        ],
        external_reference: externalReference,
        back_urls: {
          success: backUrl,
          failure: backUrl,
          pending: backUrl,
        },
        auto_return: 'approved',
        notification_url: notificationUrl,
      },
    });
  } catch (error) {
    functions.logger.error('createCheckoutSession: MP preference creation failed', {
      uid,
      packageId,
      error: error.message,
    });
    throw new functions.https.HttpsError(
      'internal',
      'No pudimos iniciar la compra. Intenta de nuevo.',
    );
  }

  const now = FieldValue.serverTimestamp();

  await db.collection('pending_purchases').doc(purchaseId).set({
    uid,
    packageId,
    externalReference,
    status: 'pending',
    amount: pkg.calderos,
    currency: CURRENCY,
    preferenceId: preference.id,
    createdAt: now,
  });

  await accountRef.update({
    pendingPurchaseId: purchaseId,
    updatedAt: now,
  });

  // Register the mock payment as pending so the rescue flow can resolve it.
  if (mp._mock) {
    mp._mock.setPaymentStatus(externalReference, 'pending', pkg.priceCLP);
  }

  functions.logger.info('createCheckoutSession: created', {
    uid,
    packageId,
    purchaseId,
    externalReference,
  });

  return {
    init_point: preference.init_point,
    purchase_id: purchaseId,
    external_reference: externalReference,
  };
}

const createCheckoutSession = functions.https.onCall(
  {
    region: 'us-central1',
    cors: CORS_ALLOWED_ORIGINS,
  },
  createCheckoutSessionHandler,
);

module.exports = createCheckoutSession;
module.exports.createCheckoutSessionHandler = createCheckoutSessionHandler;
