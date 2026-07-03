const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { nanoid } = require('nanoid');
const { FREE_TIER_CALDEROS, CURRENCY } = require('./packages');

/**
 * Core handler for createAccountWithFreeTier.
 * Separated from the Cloud Functions wrapper so it can be unit-tested
 * without invoking firebase-functions-test internals.
 *
 * @param {object} data
 * @param {functions.https.CallableContext} context
 * @returns {Promise<{success: boolean, balance: number, txId: string}>}
 */
async function createAccountWithFreeTierHandler(data, context) {
  if (!context.auth) {
    functions.logger.error('createAccountWithFreeTier: unauthenticated call');
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const uid = context.auth.uid;
  const email = data.email || context.auth.token?.email || '';
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(uid);

  functions.logger.info('createAccountWithFreeTier: start', { uid, email });

  try {
    const result = await db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef);

      if (accountDoc.exists) {
        functions.logger.warn('createAccountWithFreeTier: account already exists', { uid });
        throw new functions.https.HttpsError('already-exists', 'La cuenta ya tiene calderos gratis asignados');
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      const txId = nanoid();
      const userRef = db.collection('users').doc(uid);
      const transactionRef = db.collection('transactions').doc(txId);

      const userData = {
        uid,
        email,
        createdAt: now,
        hasCompletedOnboarding: false,
        schemaVersion: 1,
      };

      const accountData = {
        uid,
        creditsBalance: FREE_TIER_CALDEROS,
        freeCalderosUsed: 0,
        freeCalderosTotal: FREE_TIER_CALDEROS,
        lifetimeCredits: FREE_TIER_CALDEROS,
        currency: CURRENCY,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now,
        lastTopUpAt: null,
        totalTopUps: 0,
        pendingPurchaseId: null,
      };

      const transactionData = {
        uid,
        type: 'free',
        amount: FREE_TIER_CALDEROS,
        balanceAfter: FREE_TIER_CALDEROS,
        externalReference: `free-grant-${uid}`,
        packageId: null,
        metadata: { source: 'signup' },
        createdAt: now,
      };

      transaction.set(userRef, userData);
      transaction.set(accountRef, accountData);
      transaction.set(transactionRef, transactionData);

      return { txId, balance: FREE_TIER_CALDEROS };
    });

    functions.logger.info('createAccountWithFreeTier: success', { uid, balance: result.balance, txId: result.txId });
    return { success: true, balance: result.balance, txId: result.txId };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    functions.logger.error('createAccountWithFreeTier: unexpected error', { uid, error: error.message });
    throw new functions.https.HttpsError('internal', 'No se pudieron crear los calderos gratis');
  }
}

/**
 * Cloud Function: createAccountWithFreeTier
 *
 * Atomically creates the user profile, account balance and free-tier
 * transaction for a newly registered user.
 *
 * Triggered from the frontend via httpsCallable immediately after
 * Firebase Authentication signs up the user.
 */
const createAccountWithFreeTier = functions
  .region('southamerica-west1')
  .https.onCall(createAccountWithFreeTierHandler);

module.exports = createAccountWithFreeTier;
module.exports.createAccountWithFreeTierHandler = createAccountWithFreeTierHandler;
