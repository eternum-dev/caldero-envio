const functions = require('firebase-functions');
const admin = require('../admin');
const { FieldValue } = require('firebase-admin/firestore');
const { getMercadoPagoClient } = require('../mercadopago');
const creditPurchase = require('./creditPurchase');

/**
 * Callable rescue CF used after the buyer returns from the MercadoPago checkout.
 *
 * Returns the current status of a purchase and credits calderos when the
 * payment is approved. The optional `mockAction` field is only honoured when
 * the factory is in mock mode, allowing the frontend to simulate user actions
 * (approve/reject/pending) in the mock checkout without touching real MP.
 *
 * @param {{ purchaseId: string, mockAction?: 'approved' | 'rejected' | 'pending' }} data
 * @param {functions.https.CallableContext} context
 * @returns {Promise<{status: string, balance?: number, packageId?: string}>}
 */
async function checkPurchaseStatusHandler(data, context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { purchaseId, mockAction } = data || {};
  if (!purchaseId) {
    throw new functions.https.HttpsError('invalid-argument', 'purchaseId es requerido');
  }

  const db = admin.firestore();
  const pendingRef = db.collection('pending_purchases').doc(purchaseId);
  const pendingDoc = await pendingRef.get();

  if (!pendingDoc.exists) {
    return { status: 'not_found' };
  }

  const pending = pendingDoc.data();
  if (pending.uid !== context.auth.uid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No puedes consultar esta compra',
    );
  }

  // Already credited by a previous webhook?
  const existingTx = await db
    .collection('transactions')
    .where('uid', '==', pending.uid)
    .where('externalReference', '==', pending.externalReference)
    .where('type', '==', 'topup')
    .limit(1)
    .get();

  if (!existingTx.empty) {
    const tx = existingTx.docs[0].data();
    return {
      status: 'credited',
      balance: tx.balanceAfter,
      packageId: pending.packageId,
    };
  }

  const mp = await getMercadoPagoClient();

  // In mock mode, allow the frontend to drive the payment outcome.
  if (mp._mock && mockAction) {
    mp._mock.setPaymentStatus(pending.externalReference, mockAction, pending.amount);
  }

  let payment;
  try {
    payment = await mp.payment.get({ id: pending.mpPaymentId || pending.externalReference });
  } catch (error) {
    functions.logger.error('checkPurchaseStatus: MP payment lookup failed', {
      purchaseId,
      externalReference: pending.externalReference,
      error: error.message,
    });
    return { status: 'pending' };
  }

  if (payment.status === 'approved') {
    const result = await creditPurchase({
      uid: pending.uid,
      packageId: pending.packageId,
      externalReference: pending.externalReference,
      metadata: {
        mpPaymentId: payment.id,
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        rescued: true,
      },
      db,
    });

    await pendingRef.update({
      status: 'credited',
      creditedAt: FieldValue.serverTimestamp(),
      transactionId: result.transactionId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: 'credited',
      balance: result.balanceAfter,
      packageId: pending.packageId,
    };
  }

  if (['rejected', 'cancelled', 'refunded'].includes(payment.status)) {
    await pendingRef.update({
      status: payment.status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { status: payment.status };
  }

  // pending / in_process
  await pendingRef.update({
    status: payment.status || 'pending',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { status: payment.status || 'pending' };
}

const checkPurchaseStatus = functions
  .region('southamerica-west1')
  .https.onCall(checkPurchaseStatusHandler);

module.exports = checkPurchaseStatus;
module.exports.checkPurchaseStatusHandler = checkPurchaseStatusHandler;
