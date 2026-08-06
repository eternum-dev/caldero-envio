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

const { FREE_TIER_CALDEROS } = require('./packages');
const { createAccountWithFreeTierHandler } = require('./createAccountWithFreeTier');

const UID = 'test-user-123';
const EMAIL = 'test@example.com';

async function cleanup() {
  const db = admin.firestore();
  const batch = db.batch();
  const refs = [
    db.collection('users').doc(UID),
    db.collection('accounts').doc(UID),
  ];

  const transactionsSnap = await db
    .collection('transactions')
    .where('uid', '==', UID)
    .get();

  refs.forEach(ref => batch.delete(ref));
  transactionsSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

describe('createAccountWithFreeTierHandler', () => {
  beforeEach(cleanup);
  after(cleanup);

  it('creates user, account and free transaction for authenticated user', async () => {
    const result = await createAccountWithFreeTierHandler(
      { email: EMAIL },
      { auth: { uid: UID, token: { email: EMAIL } } },
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.balance, FREE_TIER_CALDEROS);
    assert.ok(result.txId);

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(UID).get();
    const accountDoc = await db.collection('accounts').doc(UID).get();
    const txDoc = await db.collection('transactions').doc(result.txId).get();

    assert.ok(userDoc.exists, 'user document should exist');
    assert.strictEqual(userDoc.data().uid, UID);
    assert.strictEqual(userDoc.data().email, EMAIL);

    assert.ok(accountDoc.exists, 'account document should exist');
    assert.strictEqual(accountDoc.data().uid, UID);
    assert.strictEqual(accountDoc.data().creditsBalance, FREE_TIER_CALDEROS);
    assert.strictEqual(accountDoc.data().freeCalderosTotal, FREE_TIER_CALDEROS);
    assert.strictEqual(accountDoc.data().lifetimeCredits, FREE_TIER_CALDEROS);
    assert.strictEqual(accountDoc.data().currency, 'CLP');
    assert.strictEqual(accountDoc.data().schemaVersion, 1);

    assert.ok(txDoc.exists, 'transaction document should exist');
    assert.strictEqual(txDoc.data().uid, UID);
    assert.strictEqual(txDoc.data().type, 'free');
    assert.strictEqual(txDoc.data().amount, FREE_TIER_CALDEROS);
    assert.strictEqual(txDoc.data().balanceAfter, FREE_TIER_CALDEROS);
    assert.strictEqual(txDoc.data().externalReference, `free-grant-${UID}`);
    assert.strictEqual(txDoc.data().packageId, null);
    assert.deepStrictEqual(txDoc.data().metadata, { source: 'signup' });
  });

  it('throws unauthenticated for anonymous calls', async () => {
    await assert.rejects(
      async () => createAccountWithFreeTierHandler({ email: EMAIL }, {}),
      { code: 'unauthenticated' },
    );
  });

  it('throws already-exists when account already exists', async () => {
    const db = admin.firestore();
    await db.collection('accounts').doc(UID).set({
      uid: UID,
      creditsBalance: FREE_TIER_CALDEROS,
    });

    await assert.rejects(
      async () => createAccountWithFreeTierHandler({ email: EMAIL }, { auth: { uid: UID } }),
      { code: 'already-exists' },
    );
  });
});
