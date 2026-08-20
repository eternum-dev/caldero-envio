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
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const mp = await getMercadoPagoClient();
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const dataId = (req.query && req.query['data.id']) || req.body?.data?.id;

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
    const payment = await mp.payment.get({ id: paymentId });
    const externalReference = payment.external_reference;

    if (!externalReference) {
      functions.logger.error('handlePaymentWebhook: missing external_reference', { paymentId });
      return res.status(400).send('Bad Request');
    }

    const parts = externalReference.split('_');
    if (parts.length < 2) {
      functions.logger.error('handlePaymentWebhook: corrupt external_reference', {
        externalReference,
      });
      return res.status(400).send('Bad Request');
    }

    const uid = parts[0];
    const packageId = parts[1];

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
