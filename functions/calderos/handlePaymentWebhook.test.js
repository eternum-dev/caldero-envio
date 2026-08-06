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

const handlePaymentWebhook = require('./handlePaymentWebhook');
const { getMercadoPagoClient, resetMercadoPagoClient, MOCK_SIGNATURE } = require('../mercadopago');
const { FREE_TIER_CALDEROS } = require('./packages');

const UID = 'webhook-user-123';
const PACKAGE_ID = 'mini';
const EXTERNAL_REF = `${UID}_${PACKAGE_ID}_abc123xyz`;
const PURCHASE_ID = 'purchase-webhook-123';

function buildReq({ signature = MOCK_SIGNATURE, body = {} } = {}) {
  return {
    method: 'POST',
    headers: {
      'x-signature': signature,
      'x-request-id': 'req-123',
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

describe('handlePaymentWebhook', () => {
  beforeEach(async () => {
    delete process.env.MP_ACCESS_TOKEN;
    resetMercadoPagoClient();
    await cleanup();
    await seedPending();
  });
  after(cleanup);

  it('returns 401 for invalid signature', async () => {
    const req = buildReq({ signature: 'bad-signature', body: {} });
    const res = buildRes();
    await handlePaymentWebhook(req, res);
    assert.strictEqual(res.statusCode, 401);
  });

  it('ignores non-payment events', async () => {
    const req = buildReq({
      body: { type: 'merchant_order', action: 'order.created' },
    });
    const res = buildRes();
    await handlePaymentWebhook(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, 'Ignored');
  });

  it('credits calderos on approved payment', async () => {
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

    const txSnap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'topup')
      .get();
    assert.strictEqual(txSnap.size, 1);
    assert.strictEqual(txSnap.docs[0].data().externalReference, EXTERNAL_REF);

    const pendingDoc = await db.collection('pending_purchases').doc(PURCHASE_ID).get();
    assert.strictEqual(pendingDoc.data().status, 'credited');
  });

  it('does not double-credit on duplicate webhook', async () => {
    const client = await getMercadoPagoClient();
    client._mock.setPaymentStatus(EXTERNAL_REF, 'approved', 4990);

    const body = {
      type: 'payment',
      action: 'payment.created',
      data: { id: EXTERNAL_REF },
    };

    await handlePaymentWebhook(buildReq({ body }), buildRes());
    await handlePaymentWebhook(buildReq({ body }), buildRes());

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS + 150);

    const txSnap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'topup')
      .get();
    assert.strictEqual(txSnap.size, 1);
  });

  it('records failed payment without crediting', async () => {
    const client = await getMercadoPagoClient();
    client._mock.setPaymentStatus(EXTERNAL_REF, 'rejected', 4990);

    const req = buildReq({
      body: {
        type: 'payment',
        action: 'payment.updated',
        data: { id: EXTERNAL_REF },
      },
    });
    const res = buildRes();
    await handlePaymentWebhook(req, res);

    assert.strictEqual(res.statusCode, 200);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS);

    const txSnap = await db
      .collection('transactions')
      .where('uid', '==', UID)
      .where('type', '==', 'payment_failed')
      .get();
    assert.strictEqual(txSnap.size, 1);

    const pendingDoc = await db.collection('pending_purchases').doc(PURCHASE_ID).get();
    assert.strictEqual(pendingDoc.data().status, 'rejected');
  });

  it('returns 400 for corrupt external_reference', async () => {
    const req = buildReq({
      body: {
        type: 'payment',
        action: 'payment.created',
        data: { id: 'mock-payment-corrupt' },
      },
    });
    const client = await getMercadoPagoClient();
    client._mock.setPaymentStatus('corrupt', 'approved', 4990);

    const res = buildRes();
    await handlePaymentWebhook(req, res);
    assert.strictEqual(res.statusCode, 400);
  });
});
