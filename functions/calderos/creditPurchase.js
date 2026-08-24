const functions = require('firebase-functions');
const admin = require('../admin');
const { FieldValue } = require('firebase-admin/firestore');
const { nanoid } = require('nanoid');
const { PACKAGES } = require('./packages');

/**
 * Atomic helper that credits calderos to an account and records a 'topup'
 * transaction. It is NOT a Cloud Function; it must only be invoked from
 * authenticated CF handlers (handlePaymentWebhook, checkPurchaseStatus).
 *
 * Idempotency is CRITICAL here. MP reenvía webhooks when the first delivery
 * fails (timeout, network blip, etc.) — a single purchase can trigger 2-5
 * webhook calls. Without the `existingTx` check below, we'd credit
 * calderos on each call, doubling/tripling the purchase.
 *
 * The defense-in-depth is: query for an existing 'topup' transaction
 * with the same externalReference INSIDE the runTransaction. If found,
 * return idempotent=true without modifying anything. If not, atomically
 * update the account + create the transaction.
 *
 * externalReference contract: created in createCheckoutSession as
 *   `${uid}_${packageId}_${nanoid(12)}`
 * The `uid` prefix is intentional — it ties the reference to the user,
 * so even if MP sends the wrong metadata, the query filter prevents
 * cross-user credit.
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
    // runTransaction = "all or nothing". If anything inside throws, NO
    // writes happen. Critical for atomicity: either we credit + log tx
    // together, or we don't credit at all. Prevents partial state where
    // account has new balance but no transaction record.
    const result = await db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Cuenta no encontrada');
      }

      // Idempotency check: query for an existing 'topup' transaction with
      // the same externalReference. If MP retried the webhook, this query
      // finds the previous credit and we skip the update.
      // The (uid, externalReference, type) tuple is unique by design.
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

      // First-time credit path. (account.X || 0) is defensive in case
      // a legacy account doc is missing these fields (pre-v1 schema).
      const account = accountDoc.data();
      const newBalance = (account.creditsBalance || 0) + pkg.calderos;
      const newLifetime = (account.lifetimeCredits || 0) + pkg.calderos;
      const now = FieldValue.serverTimestamp();

      transaction.update(accountRef, {
        creditsBalance: newBalance,
        lifetimeCredits: newLifetime,
        lastTopUpAt: now,
        totalTopUps: (account.totalTopUps || 0) + 1,
        updatedAt: now,
        // Clear the "in progress" flag. checkPurchaseStatus uses this
        // field to know if a purchase is still pending vs completed.
        // If we don't clear it, the rescue flow may re-credit on retry.
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
