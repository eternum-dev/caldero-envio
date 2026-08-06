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
    projectId: 'caldero-envio-integration-test',
  });
}

const creditPurchase = require('../calderos/creditPurchase');
const { createCheckoutSessionHandler } = require('../calderos/createCheckoutSession');
const { checkPurchaseStatusHandler } = require('../calderos/checkPurchaseStatus');
const handlePaymentWebhook = require('../calderos/handlePaymentWebhook');
const { getMercadoPagoClient, resetMercadoPagoClient, MOCK_SIGNATURE } = require('../mercadopago');
const { FREE_TIER_CALDEROS } = require('../calderos/packages');

const UID = 'integration-user-123';
const EMAIL = 'integration@example.com';
const PACKAGE_ID = 'mini';
const EXTERNAL_REF = `${UID}_${PACKAGE_ID}_integrationxyz`;

function buildReq({ signature = MOCK_SIGNATURE, body = {} } = {}) {
  return {
    method: 'POST',
    headers: {
      'x-signature': signature,
      'x-request-id': 'req-integration',
    },
    body,
  };
}

function buildRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
  return res;
}

async function cleanup() {
  const db = admin.firestore();
  const batch = db.batch();
  const refs = [
    db.collection('users').doc(UID),
    db.collection('accounts').doc(UID),
  ];

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

async function seedAccount(uid = UID) {
  const db = admin.firestore();
  await db.collection('accounts').doc(uid).set({
    uid,
    creditsBalance: FREE_TIER_CALDEROS,
    lifetimeCredits: FREE_TIER_CALDEROS,
    totalTopUps: 0,
  });
}

async function seedPending(purchaseId, externalReference = EXTERNAL_REF) {
  const db = admin.firestore();
  await db.collection('pending_purchases').doc(purchaseId).set({
    uid: UID,
    packageId: PACKAGE_ID,
    externalReference,
    status: 'pending',
    amount: 150,
  });
}

describe('integration: calderos purchase flow', () => {
  beforeEach(async () => {
    delete process.env.MP_ACCESS_TOKEN;
    resetMercadoPagoClient();
    await cleanup();
    await seedAccount();
  });
  after(cleanup);

  it('creditPurchase credits calderos and creates a topup transaction', async () => {
    const result = await creditPurchase({
      uid: UID,
      packageId: PACKAGE_ID,
      externalReference: EXTERNAL_REF,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.idempotent, false);
    assert.strictEqual(result.balanceAfter, FREE_TIER_CALDEROS + 150);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(accountDoc.data().lifetimeCredits, FREE_TIER_CALDEROS + 150);
    assert.strictEqual(accountDoc.data().totalTopUps, 1);

    const txDoc = await db.collection('transactions').doc(result.transactionId).get();
    assert.strictEqual(txDoc.data().type, 'topup');
    assert.strictEqual(txDoc.data().amount, 150);
  });

  it('creditPurchase is idempotent for the same externalReference', async () => {
    await creditPurchase({ uid: UID, packageId: PACKAGE_ID, externalReference: EXTERNAL_REF });
    const result = await creditPurchase({ uid: UID, packageId: PACKAGE_ID, externalReference: EXTERNAL_REF });

    assert.strictEqual(result.idempotent, true);

    const db = admin.firestore();
    const snap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'topup')
      .get();
    assert.strictEqual(snap.size, 1);
  });

  it('creditPurchase throws not-found when account does not exist', async () => {
    await cleanup();
    await assert.rejects(
      async () =>
        creditPurchase({ uid: UID, packageId: PACKAGE_ID, externalReference: EXTERNAL_REF }),
      { code: 'not-found' },
    );
  });

  it('creditPurchase race condition only credits once', async () => {
    const attempts = await Promise.allSettled([
      creditPurchase({ uid: UID, packageId: PACKAGE_ID, externalReference: EXTERNAL_REF }),
      creditPurchase({ uid: UID, packageId: PACKAGE_ID, externalReference: EXTERNAL_REF }),
    ]);

    const fulfilled = attempts.filter(a => a.status === 'fulfilled');
    assert.strictEqual(fulfilled.length, 2, 'ambas llamadas deberían completar');

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);

    const txSnap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'topup')
      .get();
    assert.strictEqual(txSnap.size, 1, 'solo debe existir una transacción topup');
  });

  it('createCheckoutSession creates a pending purchase', async () => {
    const result = await createCheckoutSessionHandler(
      { packageId: PACKAGE_ID },
      { auth: { uid: UID } },
    );

    assert.ok(result.purchase_id);
    assert.ok(result.init_point.includes('mock.mercadopago.com'));

    const db = admin.firestore();
    const pendingDoc = await db.collection('pending_purchases').doc(result.purchase_id).get();
    assert.strictEqual(pendingDoc.data().uid, UID);
    assert.strictEqual(pendingDoc.data().packageId, PACKAGE_ID);
    assert.strictEqual(pendingDoc.data().status, 'pending');
    assert.strictEqual(pendingDoc.data().externalReference, result.external_reference);

    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().pendingPurchaseId, result.purchase_id);
  });

  it('checkPurchaseStatus rescues an approved payment', async () => {
    const purchaseId = 'purchase-rescue-integration';
    await seedPending(purchaseId);

    const result = await checkPurchaseStatusHandler(
      { purchaseId, mockAction: 'approved' },
      { auth: { uid: UID } },
    );

    assert.strictEqual(result.status, 'credited');
    assert.strictEqual(result.balance, FREE_TIER_CALDEROS + 150);

    const db = admin.firestore();
    const pendingDoc = await db.collection('pending_purchases').doc(purchaseId).get();
    assert.strictEqual(pendingDoc.data().status, 'credited');
  });

  it('handlePaymentWebhook credits on valid signature', async () => {
    const purchaseId = 'purchase-webhook-integration';
    await seedPending(purchaseId);

    const client = await getMercadoPagoClient();
    client._mock.setPaymentStatus(EXTERNAL_REF, 'approved', 4990);

    const req = buildReq({
      body: {
        type: 'payment',
        action: 'payment.created',
        data: { id: EXTERNAL_REF },
      },
    });
    const res = buildRes();

    await handlePaymentWebhook(req, res);

    assert.strictEqual(res.statusCode, 200);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);

    const pendingDoc = await db.collection('pending_purchases').doc(purchaseId).get();
    assert.strictEqual(pendingDoc.data().status, 'credited');
    assert.ok(pendingDoc.data().mpPaymentId);
  });
});
