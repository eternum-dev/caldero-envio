const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'caldero-envio-functions-test',
  });
}

const { createCheckoutSessionHandler } = require('./createCheckoutSession');
const { resetMercadoPagoClient } = require('../mercadopago');
const { FREE_TIER_CALDEROS } = require('./packages');

const UID = 'checkout-user-123';

async function cleanup() {
  const db = admin.firestore();
  const batch = db.batch();
  const refs = [db.collection('accounts').doc(UID)];

  const pendingSnap = await db
    .collection('pending_purchases')
    .where('uid', '==', UID)
    .get();

  refs.forEach(ref => batch.delete(ref));
  pendingSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

async function seedAccount() {
  const db = admin.firestore();
  await db.collection('accounts').doc(UID).set({
    uid: UID,
    creditsBalance: FREE_TIER_CALDEROS,
    lifetimeCredits: FREE_TIER_CALDEROS,
    totalTopUps: 0,
  });
}

describe('createCheckoutSessionHandler', () => {
  beforeEach(async () => {
    delete process.env.MP_ACCESS_TOKEN;
    resetMercadoPagoClient();
    await cleanup();
    await seedAccount();
  });
  after(cleanup);

  it('creates a pending purchase and returns init_point + purchase_id', async () => {
    const result = await createCheckoutSessionHandler(
      { packageId: 'mini' },
      { auth: { uid: UID } },
    );

    assert.ok(result.init_point.includes('mock.mercadopago.com'));
    assert.ok(result.purchase_id);
    assert.ok(result.external_reference.startsWith(`${UID}_mini_`));

    const db = admin.firestore();
    const pendingDoc = await db.collection('pending_purchases').doc(result.purchase_id).get();
    assert.ok(pendingDoc.exists);
    assert.strictEqual(pendingDoc.data().uid, UID);
    assert.strictEqual(pendingDoc.data().packageId, 'mini');
    assert.strictEqual(pendingDoc.data().status, 'pending');
    assert.strictEqual(pendingDoc.data().externalReference, result.external_reference);

    const accountDoc = await db.collection('accounts').doc(UID).get();
    assert.strictEqual(accountDoc.data().pendingPurchaseId, result.purchase_id);
  });

  it('throws unauthenticated for anonymous calls', async () => {
    await assert.rejects(
      async () => createCheckoutSessionHandler({ packageId: 'mini' }, {}),
      { code: 'unauthenticated' },
    );
  });

  it('throws invalid-argument for invalid packageId', async () => {
    await assert.rejects(
      async () => createCheckoutSessionHandler({ packageId: 'invalid' }, { auth: { uid: UID } }),
      { code: 'invalid-argument' },
    );
  });

  it('throws not-found when account does not exist', async () => {
    await cleanup();
    await assert.rejects(
      async () => createCheckoutSessionHandler({ packageId: 'mini' }, { auth: { uid: UID } }),
      { code: 'not-found' },
    );
  });
});
