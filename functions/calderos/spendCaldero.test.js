const { describe, it, beforeEach, after, afterEach } = require('node:test');
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

const { spendCalderoHandler } = require('./spendCaldero');

const TEST_UID = 'test-uid-spendcaldero-001';
const OTHER_UID = 'test-uid-spendcaldero-002';

async function clearTestDocs(uid) {
  const db = admin.firestore();
  const batch = db.batch();
  batch.delete(db.collection('accounts').doc(uid));

  const transactionsSnap = await db
    .collection('transactions')
    .where('uid', '==', uid)
    .get();
  transactionsSnap.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
}

async function clearAllTestDocs() {
  await clearTestDocs(TEST_UID);
  await clearTestDocs(OTHER_UID);
}

async function seedAccount(uid, balance) {
  const db = admin.firestore();
  await db.collection('accounts').doc(uid).set({
    uid,
    creditsBalance: balance,
    freeCalderosUsed: 0,
    freeCalderosTotal: 10,
    lifetimeCredits: balance,
    currency: 'CLP',
    schemaVersion: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastTopUpAt: null,
    totalTopUps: 0,
    pendingPurchaseId: null,
  });
}

function authedContext(uid = TEST_UID) {
  return {
    auth: { uid, token: { email: `${uid}@example.com` } },
  };
}

function anonContext() {
  return { auth: null };
}

describe('spendCalderoHandler', () => {
  beforeEach(clearAllTestDocs);
  afterEach(clearAllTestDocs);
  after(clearAllTestDocs);

  it('throws unauthenticated when context.auth is missing', async () => {
    await assert.rejects(
      () => spendCalderoHandler({}, anonContext()),
      { code: 'unauthenticated' },
    );
  });

  it('throws not-found when account does not exist', async () => {
    await assert.rejects(
      () => spendCalderoHandler({}, authedContext('nonexistent-uid-xxx')),
      { code: 'not-found' },
    );
  });

  it('throws failed-precondition when balance is zero', async () => {
    await seedAccount(TEST_UID, 0);

    await assert.rejects(
      () => spendCalderoHandler({}, authedContext()),
      (err) => err.code === 'failed-precondition' && /Sin calderos/.test(err.message),
    );
  });

  it('decrements creditsBalance by 1 on success', async () => {
    await seedAccount(TEST_UID, 5);

    const result = await spendCalderoHandler({}, authedContext());
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.balanceAfter, 4);
    assert.strictEqual(result.idempotent, false);
    assert.ok(result.transactionId);

    const db = admin.firestore();
    const accountDoc = await db.collection('accounts').doc(TEST_UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, 4);
  });

  it('creates a deduction transaction with expected fields', async () => {
    await seedAccount(TEST_UID, 3);

    const result = await spendCalderoHandler({ idempotencyKey: 'idem-abc-123' }, authedContext());

    const db = admin.firestore();
    const txDoc = await db.collection('transactions').doc(result.transactionId).get();
    assert.ok(txDoc.exists);
    const tx = txDoc.data();
    assert.strictEqual(tx.uid, TEST_UID);
    assert.strictEqual(tx.type, 'deduction');
    assert.strictEqual(tx.amount, -1);
    assert.strictEqual(tx.balanceAfter, 2);
    assert.strictEqual(tx.metadata.source, 'calculate');
    assert.strictEqual(tx.metadata.idempotencyKey, 'idem-abc-123');
    assert.match(tx.externalReference, new RegExp(`^${TEST_UID}_deduction_`));
  });

  it('returns idempotent:true on second call with the same key', async () => {
    await seedAccount(TEST_UID, 5);

    const first = await spendCalderoHandler({ idempotencyKey: 'same-key' }, authedContext());
    const second = await spendCalderoHandler({ idempotencyKey: 'same-key' }, authedContext());

    assert.strictEqual(first.balanceAfter, 4);
    assert.strictEqual(second.balanceAfter, 4);
    assert.strictEqual(first.idempotent, false);
    assert.strictEqual(second.idempotent, true);
    assert.strictEqual(first.transactionId, second.transactionId);

    const db = admin.firestore();
    const txs = await db
      .collection('transactions')
      .where('uid', '==', TEST_UID)
      .where('type', '==', 'deduction')
      .get();
    // 1 tx with idempotencyKey='same-key', 0 with other keys.
    const sameKeyTx = txs.docs.filter((d) => d.data().metadata?.idempotencyKey === 'same-key');
    assert.strictEqual(sameKeyTx.length, 1);

    const accountDoc = await db.collection('accounts').doc(TEST_UID).get();
    assert.strictEqual(accountDoc.data().creditsBalance, 4);
  });

  it('does not affect other users when called', async () => {
    await seedAccount(TEST_UID, 5);
    await seedAccount(OTHER_UID, 5);

    await spendCalderoHandler({}, authedContext(TEST_UID));

    const db = admin.firestore();
    const otherDoc = await db.collection('accounts').doc(OTHER_UID).get();
    assert.strictEqual(otherDoc.data().creditsBalance, 5);
  });

  it('does not allow idempotencyKey collision across different users', async () => {
    await seedAccount(TEST_UID, 5);
    await seedAccount(OTHER_UID, 5);

    const a = await spendCalderoHandler({ idempotencyKey: 'shared' }, authedContext(TEST_UID));
    const b = await spendCalderoHandler({ idempotencyKey: 'shared' }, authedContext(OTHER_UID));

    assert.strictEqual(a.idempotent, false);
    assert.strictEqual(b.idempotent, false);
    assert.notStrictEqual(a.transactionId, b.transactionId);

    const db = admin.firestore();
    const aDoc = await db.collection('accounts').doc(TEST_UID).get();
    const bDoc = await db.collection('accounts').doc(OTHER_UID).get();
    assert.strictEqual(aDoc.data().creditsBalance, 4);
    assert.strictEqual(bDoc.data().creditsBalance, 4);
  });
});
