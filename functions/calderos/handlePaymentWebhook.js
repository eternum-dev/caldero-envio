const functions = require('firebase-functions');
const admin = require('../admin');
const { FieldValue } = require('firebase-admin/firestore');
const { nanoid } = require('nanoid');
const { getMercadoPagoClient } = require('../mercadopago');
const creditPurchase = require('./creditPurchase');

/**
 * Public HTTP Cloud Function that receives MercadoPago webhooks.
 *
 * In mock mode the signature verification is skipped for the known mock
 * signature (see functions/mercadopago.js). In real mode it uses the SDK's
 * HMAC validator with MP_WEBHOOK_SECRET.
 */
async function handlePaymentWebhookHandler(req, res) {
  // Manual method check. Cloud Functions onRequest accepts any HTTP method;
  // we only want POST (MP webhooks are POST). Returning 405 for others is
  // the standard HTTP semantic and helps MP debug if they ever POST to a
  // wrong URL.
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const mp = await getMercadoPagoClient();
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  // MP can send data.id in query string OR in body.data.id (depending on
  // notification type). Accept both for compatibility.
  const dataId = (req.query && req.query['data.id']) || req.body?.data?.id;

  // CRITICAL: signature verification. Without this, ANYONE who knows the
  // webhook URL could POST a fake event and credit calderos to any account.
  // The SDK uses HMAC-SHA256 with MP_WEBHOOK_SECRET.
  // In mock mode (no MP_ACCESS_TOKEN), verification is skipped to allow
  // local testing — see functions/mercadopago.js shouldUseMock().
  try {
    mp.verifyWebhookSignature({
      xSignature,
      xRequestId,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET,
    });
  } catch (error) {
    functions.logger.error('handlePaymentWebhook: invalid signature', {
      xRequestId,
      error: error.message,
    });
    return res.status(401).send('Unauthorized');
  }

  const body = req.body || {};
  const { type, action } = body;

  // MP sends many webhook types: payment.created, payment.updated, plan.*,
  // subscription.*, invoice.*, etc. We only care about payment state
  // changes. Returning 200 (not 4xx) tells MP "received ok, don't retry"
  // — important for events we deliberately ignore.
  if (type !== 'payment' || !['payment.created', 'payment.updated'].includes(action)) {
    functions.logger.info('handlePaymentWebhook: ignored event', { type, action });
    return res.status(200).send('Ignored');
  }

  const paymentId = body.data?.id;
  if (!paymentId) {
    functions.logger.error('handlePaymentWebhook: missing payment id', { body });
    return res.status(400).send('Bad Request');
  }

  const db = admin.firestore();

  try {
    // Re-fetch the payment from MP API. We don't trust the webhook body
    // for the source of truth (it only has the payment ID). The API call
    // gives us the canonical status, amount, external_reference, etc.
    const payment = await mp.payment.get({ id: paymentId });
    const externalReference = payment.external_reference;

    if (!externalReference) {
      functions.logger.error('handlePaymentWebhook: missing external_reference', { paymentId });
      return res.status(400).send('Bad Request');
    }

    // externalReference contract: created in createCheckoutSession as
    //   `${uid}_${packageId}_${nanoid(12)}`
    // First segment = uid, second = packageId. We split defensively
    // (length < 2) because if MP ever mangled the reference, we don't
    // want to silently credit the wrong user.
    const parts = externalReference.split('_');
    if (parts.length < 2) {
      functions.logger.error('handlePaymentWebhook: corrupt external_reference', {
        externalReference,
      });
      return res.status(400).send('Bad Request');
    }

    const uid = parts[0];
    const packageId = parts[1];

    // Look up the pending_purchase record created at checkout time. It
    // exists if the user went through our normal flow. If not, it could
    // be a manual API call or test — we still process but skip the
    // pending_purchase update.
    const pendingSnap = await db
      .collection('pending_purchases')
      .where('externalReference', '==', externalReference)
      .limit(1)
      .get();
    const pendingDoc = pendingSnap.empty ? null : pendingSnap.docs[0];

    const now = FieldValue.serverTimestamp();

    if (payment.status === 'approved') {
      const result = await creditPurchase({
        uid,
        packageId,
        externalReference,
        metadata: {
          mpPaymentId: payment.id,
          mpStatus: payment.status,
          mpStatusDetail: payment.status_detail,
        },
        db,
      });

      if (pendingDoc) {
        await pendingDoc.ref.update({
          status: 'credited',
          creditedAt: now,
          transactionId: result.transactionId,
          mpPaymentId: payment.id,
          updatedAt: now,
        });
      }

      functions.logger.info('handlePaymentWebhook: credited', {
        uid,
        packageId,
        externalReference,
        balanceAfter: result.balanceAfter,
      });
    } else if (['rejected', 'cancelled', 'refunded'].includes(payment.status)) {
      const accountDoc = await db.collection('accounts').doc(uid).get();
      const balanceAfter = accountDoc.exists ? accountDoc.data().creditsBalance : 0;

      await db
        .collection('transactions')
        .doc(nanoid())
        .set({
          uid,
          type: 'payment_failed',
          amount: 0,
          balanceAfter,
          externalReference,
          packageId,
          metadata: {
            mpPaymentId: payment.id,
            mpStatus: payment.status,
            mpStatusDetail: payment.status_detail,
          },
          createdAt: now,
        });

      if (pendingDoc) {
        await pendingDoc.ref.update({
          status: payment.status,
          mpPaymentId: payment.id,
          updatedAt: now,
        });
      }

      functions.logger.info('handlePaymentWebhook: recorded failed payment', {
        uid,
        packageId,
        externalReference,
        status: payment.status,
      });
    } else {
      // pending, in_process, etc.
      if (pendingDoc) {
        await pendingDoc.ref.update({
          status: payment.status,
          mpPaymentId: payment.id,
          updatedAt: now,
        });
      }

      functions.logger.info('handlePaymentWebhook: pending payment', {
        uid,
        packageId,
        externalReference,
        status: payment.status,
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    functions.logger.error('handlePaymentWebhook: processing error', {
      paymentId,
      error: error.message,
    });
    return res.status(500).send('Internal Server Error');
  }
}

const handlePaymentWebhook = functions
  .region('us-central1')
  .https.onRequest(handlePaymentWebhookHandler);

module.exports = handlePaymentWebhook;
module.exports.handlePaymentWebhookHandler = handlePaymentWebhookHandler;
