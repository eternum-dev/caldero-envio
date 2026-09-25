const functions = require('firebase-functions');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('../admin');
const { FieldValue } = require('firebase-admin/firestore');
const { nanoid } = require('nanoid');

/**
 * Core handler for spendCaldero.
 * Separated from the Cloud Functions wrapper so it can be unit-tested
 * without invoking firebase-functions-test internals.
 *
 * Atomically decrements a user's calderos balance by 1 and records a
 * 'deduction' transaction. Optional idempotencyKey lets the client
 * safely retry without double-charging.
 *
 * @param {object} data
 * @param {functions.https.CallableContext} context
 * @returns {Promise<{success: boolean, balanceAfter: number, transactionId: string, idempotent: boolean}>}
 */
async function spendCalderoHandler(data, context) {
  if (!context.auth) {
    functions.logger.error('spendCaldero: unauthenticated call');
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const uid = context.auth.uid;
  const idempotencyKey = data?.idempotencyKey || null;
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(uid);

  functions.logger.info('spendCaldero: start', { uid, hasIdempotencyKey: !!idempotencyKey });

  try {
    const result = await db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef);

      if (!accountDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'No tienes cuenta. Regístrate primero para recibir calderos gratis.',
        );
      }

      // Idempotency check: if a previous spend with the same key succeeded,
      // we return the same result without applying a second debit. This
      // protects against client-side retries (network blip, user double-click
      // on the calculate button) that would otherwise drain the user's
      // balance faster than expected.
      if (idempotencyKey) {
        const existingTx = await transaction.get(
          db
            .collection('transactions')
            .where('uid', '==', uid)
            .where('metadata.idempotencyKey', '==', idempotencyKey)
            .where('type', '==', 'deduction')
            .limit(1),
        );

        if (!existingTx.empty) {
          const txDoc = existingTx.docs[0];
          const txData = txDoc.data();
          functions.logger.info('spendCaldero: idempotent skip', {
            uid,
            idempotencyKey,
            transactionId: txDoc.id,
          });
          return {
            success: true,
            balanceAfter: txData.balanceAfter,
            transactionId: txDoc.id,
            idempotent: true,
          };
        }
      }

      const account = accountDoc.data();
      const currentBalance = account.creditsBalance || 0;

      if (currentBalance <= 0) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Sin calderos disponibles. Comprá más para seguir calculando.',
        );
      }

      const newBalance = currentBalance - 1;
      const txId = nanoid();
      const now = FieldValue.serverTimestamp();

      transaction.update(accountRef, {
        creditsBalance: newBalance,
        updatedAt: now,
      });

      const txRef = db.collection('transactions').doc(txId);
      transaction.set(txRef, {
        uid,
        type: 'deduction',
        amount: -1,
        balanceAfter: newBalance,
        externalReference: `${uid}_deduction_${nanoid(12)}`,
        packageId: null,
        metadata: {
          source: 'calculate',
          idempotencyKey: idempotencyKey || null,
        },
        createdAt: now,
      });

      return {
        success: true,
        balanceAfter: newBalance,
        transactionId: txId,
        idempotent: false,
      };
    });

    functions.logger.info('spendCaldero: success', {
      uid,
      balanceAfter: result.balanceAfter,
      idempotent: result.idempotent,
    });

    return result;
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    functions.logger.error('spendCaldero: unexpected error', { uid, error: error.message });
    throw new functions.https.HttpsError('internal', 'No se pudo descontar el caldero. Intenta de nuevo.');
  }
}

// Same CORS pattern as createAccountWithFreeTier. Preview channel regex
// accepts any `caldero-envio--*` URL Firebase Hosting serves for PR previews.
const CORS_ALLOWED_ORIGINS = [
  'https://caldero-envio.web.app',
  'https://caldero-envio.firebaseapp.com',
  /^https:\/\/caldero-envio--.*\.web\.app$/,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Cloud Function (2nd gen): spendCaldero
 *
 * Called from the frontend via httpsCallableFromURL BEFORE each route
 * calculation. Atomically debits 1 from the user's calderos balance and
 * records a deduction transaction. Idempotent if the client passes the
 * same idempotencyKey on retry.
 *
 * 2nd gen runs on Cloud Run in southamerica-east1, matching the rest
 * of the calderos CFs.
 */
const spendCaldero = onCall(
  { region: 'southamerica-east1', cors: CORS_ALLOWED_ORIGINS },
  (request) => spendCalderoHandler(request.data, request),
);

module.exports = spendCaldero;
module.exports.spendCalderoHandler = spendCalderoHandler;
