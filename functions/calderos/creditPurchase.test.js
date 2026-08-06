const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { skipIfEmulatorUnavailable } = require('../test-utils/emulatorCheck');

if (skipIfEmulatorUnavailable()) {
  return;
}

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'caldero-envio-functions-test',
  });
}

const creditPurchase = require('./creditPurchase');
const { FREE_TIER_CALDEROS } = require('./packages');

const UID = 'credit-user-123';
const EXTERNAL_REF = `${UID}_mini_abc123xyz`;

async function cleanup() {
  const db = admin.firestore();
  const batch = db.batch();
  const refs = [db.collection('accounts').doc(UID)];

  const transactionsSnap = await db
    .collection('transactions')
    .where('uid', '==', UID)
    .get();

  refs.forEach(ref => batch.delete(ref));
  transactionsSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

async function seedAccount() {
  const db = admin.firestore();
  await db.collection('accounts').doc(UID).set({
    uid: UID,
    creditsBalance: FREE_TIER_CALDEROS,
    lifetimeCredits: FREE_TIER_CALDEROS,
    totalTopUps: 0,
    pendingPurchaseId: 'purchase-123',
  });
}

describe('creditPurchase', () => {
  beforeEach(async () => {
    await cleanup();
    await seedAccount();
  });
  after(cleanup);

  it('credits calderos and creates a topup transaction', async () => {
    const result = await creditPurchase({
      uid: UID,
      packageId: 'mini',
      externalReference: EXTERNAL_REF,
      metadata: { mpPaymentId: 'mock-1', mpStatus: 'approved' },
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.idempotent, false);
    assert.strictEqual(result.balanceAfter, FREE_TIER_CALDEROS + 150);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(accountDoc.data().lifetimeCredits, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(accountDoc.data().totalTopUps, 1);
    assert.strictEqual(accountDoc.data().pendingPurchaseId, null);

    const txDoc = await db.collection('transactions').doc(result.transactionId).get();
    assert.ok(txDoc.exists);
    assert.strictEqual(txDoc.data().type, 'topup');
    assert.strictEqual(txDoc.data().amount, 150);
    assert.strictEqual(txDoc.data().balanceAfter, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(txDoc.data().externalReference, EXTERNAL_REF);
    assert.strictEqual(txDoc.data().packageId, 'mini');
  });

  it('is idempotent for the same externalReference', async () => {
    await creditPurchase({
      uid: UID,
      packageId: 'mini',
      externalReference: EXTERNAL_REF,
    });

    const result = await creditPurchase({
      uid: UID,
      packageId: 'mini',
      externalReference: EXTERNAL_REF,
    });

    assert.strictEqual(result.idempotent, true);
    assert.strictEqual(result.balanceAfter, FREE_TIER_CALDEROS + 150);

    const db = admin.firestore();
    const snap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'topup')
      .get();
    assert.strictEqual(snap.size, 1);
  });

  it('throws not-found when account does not exist', async () => {
    await cleanup();
    await assert.rejects(
      async () =>
        creditPurchase({
          uid: UID,
          packageId: 'mini',
          externalReference: EXTERNAL_REF,
        }),
      { code: 'not-found' },
    );
  });

  it('throws invalid-argument for invalid packageId', async () => {
    await assert.rejects(
      async () =>
        creditPurchase({
          uid: UID,
          packageId: 'invalid',
          externalReference: EXTERNAL_REF,
        }),
      { code: 'invalid-argument' },
    );
  });
});
