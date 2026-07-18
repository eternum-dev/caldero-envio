const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { nanoid } = require('nanoid');
const { PACKAGES } = require('./packages');

/**
 * Atomic helper that credits calderos to an account and records a 'topup'
 * transaction. It is NOT a Cloud Function; it must only be invoked from
 * authenticated CF handlers (handlePaymentWebhook, checkPurchaseStatus).
 *
 * Idempotency is enforced by querying transactions for the same externalReference
 * and type === 'topup' within the same Firestore transaction.
 *
 * @param {{
 *   uid: string,
 *   packageId: string,
 *   externalReference: string,
 *   metadata?: object,
 *   db?: FirebaseFirestore.Firestore
 * }} options
 * @returns {Promise<{success: boolean, balanceAfter: number, transactionId: string, idempotent: boolean}>}
 */
async function creditPurchase({ uid, packageId, externalReference, metadata = {}, db }) {
  if (!db) {
    db = admin.firestore();
  }

  if (!uid || !packageId || !externalReference) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'uid, packageId y externalReference son requeridos',
    );
  }

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    throw new functions.https.HttpsError('invalid-argument', `packageId inválido: ${packageId}`);
  }

  const accountRef = db.collection('accounts').doc(uid);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Cuenta no encontrada');
      }

      const existingTx = await transaction.get(
        db
          .collection('transactions')
          .where('uid', '==', uid)
          .where('externalReference', '==', externalReference)
          .where('type', '==', 'topup')
          .limit(1),
      );

      if (!existingTx.empty) {
        const txDoc = existingTx.docs[0];
        const txData = txDoc.data();
        functions.logger.info('creditPurchase: idempotent skip', {
          uid,
          externalReference,
          transactionId: txDoc.id,
        });
        return {
          success: true,
          balanceAfter: txData.balanceAfter,
          transactionId: txDoc.id,
          idempotent: true,
        };
      }

      const account = accountDoc.data();
      const newBalance = (account.creditsBalance || 0) + pkg.calderos;
      const newLifetime = (account.lifetimeCredits || 0) + pkg.calderos;
      const now = admin.firestore.FieldValue.serverTimestamp();

      transaction.update(accountRef, {
        creditsBalance: newBalance,
        lifetimeCredits: newLifetime,
        lastTopUpAt: now,
        totalTopUps: (account.totalTopUps || 0) + 1,
        updatedAt: now,
        pendingPurchaseId: null,
      });

      const txId = nanoid();
      const txRef = db.collection('transactions').doc(txId);
      transaction.set(txRef, {
        uid,
        type: 'topup',
        amount: pkg.calderos,
        balanceAfter: newBalance,
        externalReference,
        packageId,
        metadata,
        createdAt: now,
      });

      return {
        success: true,
        balanceAfter: newBalance,
        transactionId: txId,
        idempotent: false,
      };
    });

    functions.logger.info('creditPurchase: credited', {
      uid,
      packageId,
      externalReference,
      balanceAfter: result.balanceAfter,
      idempotent: result.idempotent,
    });

    return result;
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    functions.logger.error('creditPurchase: error', {
      uid,
      packageId,
      externalReference,
      error: error.message,
    });
    throw new functions.https.HttpsError('internal', 'No se pudieron acreditar los calderos');
  }
}

module.exports = creditPurchase;
module.exports.creditPurchase = creditPurchase;
