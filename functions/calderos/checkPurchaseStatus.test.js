const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'caldero-envio-functions-test',
  });
}

const { checkPurchaseStatusHandler } = require('./checkPurchaseStatus');
const { getMercadoPagoClient, resetMercadoPagoClient } = require('../mercadopago');
const { FREE_TIER_CALDEROS } = require('./packages');

const UID = 'rescue-user-123';
const PACKAGE_ID = 'mini';
const EXTERNAL_REF = `${UID}_${PACKAGE_ID}_abc123xyz`;
const PURCHASE_ID = 'purchase-rescue-123';

async function cleanup() {
  const db = admin.firestore();
  const batch = db.batch();
  const refs = [db.collection('accounts').doc(UID)];

  const pendingSnap = await db
    .collection('pending_purchases')
    .where('uid', '==', UID)
    .get();
  const txSnap = await db
    .collection('transactions')
    .where('uid', '==', UID)
    .get();

  refs.forEach(ref => batch.delete(ref));
  pendingSnap.forEach(doc => batch.delete(doc.ref));
  txSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

async function seedPending() {
  const db = admin.firestore();
  await db.collection('accounts').doc(UID).set({
    uid: UID,
    creditsBalance: FREE_TIER_CALDEROS,
    lifetimeCredits: FREE_TIER_CALDEROS,
    totalTopUps: 0,
  });

  await db.collection('pending_purchases').doc(PURCHASE_ID).set({
    uid: UID,
    packageId: PACKAGE_ID,
    externalReference: EXTERNAL_REF,
    status: 'pending',
    amount: 150,
  });
}

describe('checkPurchaseStatusHandler', () => {
  beforeEach(async () => {
    delete process.env.MP_ACCESS_TOKEN;
    resetMercadoPagoClient();
    await cleanup();
    await seedPending();
  });
  after(cleanup);

  it('returns not_found for unknown purchaseId', async () => {
    const result = await checkPurchaseStatusHandler(
      { purchaseId: 'unknown' },
      { auth: { uid: UID } },
    );
    assert.strictEqual(result.status, 'not_found');
  });

  it('throws permission-denied when user does not own the purchase', async () => {
    await assert.rejects(
      async () =>
        checkPurchaseStatusHandler(
          { purchaseId: PURCHASE_ID },
          { auth: { uid: 'other-user' } },
        ),
      { code: 'permission-denied' },
    );
  });

  it('returns credited when transaction already exists', async () => {
    const db = admin.firestore();
    await db.collection('transactions').doc('tx-1').set({
      uid: UID,
      type: 'topup',
      amount: 150,
      balanceAfter: FREE_TIER_CALDEROS + 150,
      externalReference: EXTERNAL_REF,
      packageId: PACKAGE_ID,
    });

    const result = await checkPurchaseStatusHandler(
      { purchaseId: PURCHASE_ID },
      { auth: { uid: UID } },
    );

    assert.strictEqual(result.status, 'credited');
    assert.strictEqual(result.balance, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(result.packageId, PACKAGE_ID);
  });

  it('credits on approved mock payment when mockAction is provided', async () => {
    const result = await checkPurchaseStatusHandler(
      { purchaseId: PURCHASE_ID, mockAction: 'approved' },
      { auth: { uid: UID } },
    );

    assert.strictEqual(result.status, 'credited');
    assert.strictEqual(result.balance, FREE_TIER_CALDEROS + 150);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);
  });

  it('returns rejected when mockAction is rejected', async () => {
    const result = await checkPurchaseStatusHandler(
      { purchaseId: PURCHASE_ID, mockAction: 'rejected' },
      { auth: { uid: UID } },
    );

    assert.strictEqual(result.status, 'rejected');

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS);
  });

  it('returns pending when no mockAction is provided and payment is pending', async () => {
    const result = await checkPurchaseStatusHandler(
      { purchaseId: PURCHASE_ID },
      { auth: { uid: UID } },
    );

    assert.strictEqual(result.status, 'pending');
  });
});
