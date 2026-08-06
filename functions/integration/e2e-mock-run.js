/**
 * E2E mock run for the caldero purchase flow.
 *
 * Intended to be executed with Firebase emulators running:
 *   firebase emulators:exec --only firestore,auth,functions "node integration/e2e-mock-run.js"
 *
 * It exercises the full flow without real MercadoPago credentials:
 *   signup free grant -> create checkout -> approve mock payment -> verify balance
 *   plus a rescue flow for a "lost" webhook.
 */

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
delete process.env.MP_ACCESS_TOKEN;

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'caldero-envio-e2e-mock',
  });
}

const { createAccountWithFreeTierHandler } = require('../calderos/createAccountWithFreeTier');
const { createCheckoutSessionHandler } = require('../calderos/createCheckoutSession');
const { checkPurchaseStatusHandler } = require('../calderos/checkPurchaseStatus');
const { resetMercadoPagoClient } = require('../mercadopago');
const { FREE_TIER_CALDEROS } = require('../calderos/packages');

const UID = 'e2e-mock-user-123';
const EMAIL = 'e2e-mock@example.com';

const log = {
  pass: (msg) => console.log(`[PASS] ${msg}`),
  fail: (msg) => console.log(`[FAIL] ${msg}`),
  step: (msg) => console.log(`\n[STEP] ${msg}`),
};

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

async function assertBalance(expected) {
  const db = admin.firestore();
  const accountDoc = await db.collection('accounts').doc(UID).get();
  if (!accountDoc.exists) {
    throw new Error(`Account ${UID} does not exist`);
  }
  const actual = accountDoc.data().creditsBalance;
  if (actual !== expected) {
    throw new Error(`Expected balance ${expected}, got ${actual}`);
  }
  return accountDoc.data();
}

async function assertTransactionCount(type, expectedCount) {
  const db = admin.firestore();
  const snap = await db
    .collection('transactions')
    .where('uid', '==', UID)
    .where('type', '==', type)
    .get();
  if (snap.size !== expectedCount) {
    throw new Error(`Expected ${expectedCount} ${type} transactions, got ${snap.size}`);
  }
  return snap.docs.map(d => d.data());
}

async function run() {
  resetMercadoPagoClient();
  await cleanup();

  // ------------------------------------------------------------------
  // Scenario 1: signup free grant
  // ------------------------------------------------------------------
  log.step('Scenario 1: signup free grant');
  const freeGrant = await createAccountWithFreeTierHandler(
    { email: EMAIL },
    { auth: { uid: UID, token: { email: EMAIL } } },
  );
  if (!freeGrant.success) {
    throw new Error('Free grant failed');
  }
  await assertBalance(FREE_TIER_CALDEROS);
  await assertTransactionCount('free', 1);
  log.pass(`Free grant credited ${freeGrant.balance} calderos`);

  // ------------------------------------------------------------------
  // Scenario 2: buy Mini and approve via mock checkout
  // ------------------------------------------------------------------
  log.step('Scenario 2: buy Mini and approve mock checkout');
  const checkout = await createCheckoutSessionHandler(
    { packageId: 'mini' },
    { auth: { uid: UID } },
  );
  if (!checkout.init_point.includes('mock.mercadopago.com')) {
    throw new Error(`Unexpected init_point: ${checkout.init_point}`);
  }
  log.pass(`Checkout created: purchase_id=${checkout.purchase_id}`);

  const approved = await checkPurchaseStatusHandler(
    { purchaseId: checkout.purchase_id, mockAction: 'approved' },
    { auth: { uid: UID } },
  );
  if (approved.status !== 'credited') {
    throw new Error(`Expected credited, got ${approved.status}`);
  }
  await assertBalance(FREE_TIER_CALDEROS + 150);
  await assertTransactionCount('topup', 1);
  log.pass(`Approved: balance=${approved.balance}, package=${approved.packageId}`);

  // ------------------------------------------------------------------
  // Scenario 3: rescue flow (lost webhook)
  // ------------------------------------------------------------------
  log.step('Scenario 3: rescue flow for lost webhook');
  const checkout2 = await createCheckoutSessionHandler(
    { packageId: 'mini' },
    { auth: { uid: UID } },
  );
  log.pass(`Second checkout created: purchase_id=${checkout2.purchase_id}`);

  // Simulate that the webhook was never received; call rescue directly.
  const rescued = await checkPurchaseStatusHandler(
    { purchaseId: checkout2.purchase_id, mockAction: 'approved' },
    { auth: { uid: UID } },
  );
  if (rescued.status !== 'credited') {
    throw new Error(`Expected credited on rescue, got ${rescued.status}`);
  }
  await assertBalance(FREE_TIER_CALDEROS + 150 + 150);
  await assertTransactionCount('topup', 2);
  log.pass(`Rescue credited: balance=${rescued.balance}`);

  // ------------------------------------------------------------------
  // Scenario 4: idempotency / no double credit
  // ------------------------------------------------------------------
  log.step('Scenario 4: idempotency check');
  const reCheck = await checkPurchaseStatusHandler(
    { purchaseId: checkout.purchase_id, mockAction: 'approved' },
    { auth: { uid: UID } },
  );
  if (reCheck.status !== 'credited') {
    throw new Error(`Expected credited on re-check, got ${reCheck.status}`);
  }
  await assertBalance(FREE_TIER_CALDEROS + 150 + 150);
  await assertTransactionCount('topup', 2);
  log.pass('Re-check did not duplicate calderos');

  console.log('\n=== E2E mock mode: ALL PASS ===');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    log.fail(error.message);
    console.error(error);
    process.exit(1);
  });
