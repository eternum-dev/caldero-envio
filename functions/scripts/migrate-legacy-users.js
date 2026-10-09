#!/usr/bin/env node
/**
 * scripts/migrate-legacy-users.js
 *
 * Sesión 3.5 — Migración retroactiva de locales existentes.
 *
 * Creates an `accounts/{uid}` document with 50 free calderos for every
 * Firebase Auth user that does NOT yet have one (legacy users signed up
 * before the calderos system launched). Also records a 'free'
 * transaction tagged with the legacy-user migration marker.
 *
 * Critical safety guarantees:
 *   - Idempotent: skipping users that already have accounts/{uid}.
 *   - Does NOT touch users/{uid}: only ensures schemaVersion = 1.
 *   - Dry-run by default; requires --execute flag to write.
 *   - Atomic transaction per user (all-or-nothing).
 *   - externalReference uses a unique migration prefix to avoid
 *     collisions with signup `free-grant-{uid}` references.
 *
 * Usage:
 *   # Dry run (default — no writes)
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node functions/scripts/migrate-legacy-users.js
 *
 *   # Execute (write to Firestore)
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node functions/scripts/migrate-legacy-users.js --execute
 *
 *   # Limit to a single uid (good for testing the script)
 *   node functions/scripts/migrate-legacy-users.js --uid <UID>
 *
 *   # Against emulators
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 \
 *     node functions/scripts/migrate-legacy-users.js
 */

const admin = require('firebase-admin');
const { nanoid } = require('nanoid');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'caldero-envio';
const MIGRATION_BONUS = 50; // Per Sesión 3.5 obs #374 D1
const DRY_RUN = !process.argv.includes('--execute');
const targetUid = (() => {
  const i = process.argv.indexOf('--uid');
  return i > -1 ? process.argv[i + 1] : null;
})();

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();
const auth = admin.auth();

async function listUsers() {
  if (targetUid) {
    try {
      const u = await auth.getUser(targetUid);
      return [u];
    } catch (err) {
      console.error(`Could not find user ${targetUid}: ${err.message}`);
      process.exit(1);
    }
  }
  const out = [];
  let nextPageToken;
  do {
    const page = await auth.listUsers(1000, nextPageToken);
    out.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);
  return out;
}

/**
 * Returns true if the user already has an accounts/{uid} doc, regardless
 * of whether it was created by `createAccountWithFreeTier` (signups) or by
 * a previous run of this script (legacy migration).
 */
async function userHasAccount(uid) {
  const snap = await db.collection('accounts').doc(uid).get();
  return snap.exists;
}

async function ensureSchemaVersionOnUser(uid, tx) {
  const ref = db.collection('users').doc(uid);
  const snap = await tx.get(ref);
  if (!snap.exists) return { updated: false, reason: 'no users/{uid} doc' };
  const data = snap.data();
  if (data.schemaVersion === 1) return { updated: false, reason: 'already schemaVersion=1' };
  tx.update(ref, { schemaVersion: 1 });
  return { updated: true, reason: `was ${data.schemaVersion ?? 'undefined'}` };
}

async function migrateUser(user) {
  const uid = user.uid;
  const accountRef = db.collection('accounts').doc(uid);

  if (await userHasAccount(uid)) {
    return { uid, action: 'skipped', reason: 'already has accounts/{uid}' };
  }

  if (DRY_RUN) {
    return {
      uid,
      action: 'would-migrate',
      wouldCreate: {
        accountsDoc: {
          creditsBalance: MIGRATION_BONUS,
          freeCalderosTotal: MIGRATION_BONUS,
          freeCalderosUsed: 0,
          lifetimeCredits: MIGRATION_BONUS,
          currency: 'CLP',
          schemaVersion: 1,
          totalTopUps: 0,
          pendingPurchaseId: null,
          metadata: { migrationSource: 'legacy-user-thank-you' },
        },
        transactionDoc: {
          type: 'free',
          amount: MIGRATION_BONUS,
          balanceAfter: MIGRATION_BONUS,
          externalReference: `migration-early-adopter-${uid}-${nanoid(12)}`,
          metadata: { source: 'migration-3.5', legacyUser: true },
        },
      },
    };
  }

  // Real write: atomic batch (accounts + transaction + optional schemaVersion fix).
  const batch = db.batch();
  const txId = nanoid();
  const now = admin.firestore.FieldValue.serverTimestamp();

  batch.set(accountRef, {
    uid,
    creditsBalance: MIGRATION_BONUS,
    freeCalderosUsed: 0,
    freeCalderosTotal: MIGRATION_BONUS,
    lifetimeCredits: MIGRATION_BONUS,
    currency: 'CLP',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    lastTopUpAt: null,
    totalTopUps: 0,
    pendingPurchaseId: null,
    metadata: {
      migrationSource: 'legacy-user-thank-you',
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  });

  batch.set(db.collection('transactions').doc(txId), {
    uid,
    type: 'free',
    amount: MIGRATION_BONUS,
    balanceAfter: MIGRATION_BONUS,
    externalReference: `migration-early-adopter-${uid}-${nanoid(12)}`,
    packageId: null,
    metadata: { source: 'migration-3.5', legacyUser: true },
    createdAt: now,
  });

  // Schema-version fix on users/{uid} with merge so we don't clobber
  // any other fields (couriers, onboarding flags, etc.).
  const userRef = db.collection('users').doc(uid);
  batch.set(userRef, { schemaVersion: 1, uid }, { merge: true });

  await batch.commit();

  return {
    uid,
    action: 'migrated',
    creditsAdded: MIGRATION_BONUS,
    transactionId: txId,
  };
}

(async () => {
  console.log('=== Legacy Users Migration ===');
  console.log(`Project:         ${PROJECT_ID}`);
  console.log(`Firestore emu:   ${process.env.FIRESTORE_EMULATOR_HOST || '(none — using prod)'}`);
  console.log(`Mode:            ${DRY_RUN ? 'DRY RUN (no writes) — pass --execute to write' : 'EXECUTE (writing to Firestore!)'}`);
  console.log(`Target uid:      ${targetUid || '(all users)'}`);
  console.log(`Migration bonus: ${MIGRATION_BONUS} calderos per user`);
  console.log('');

  if (!DRY_RUN) {
    console.log('!! WARNING: --execute was passed. This will write to Firestore.');
    console.log('!! Press Ctrl-C within 5 seconds to abort...');
    await new Promise((res) => setTimeout(res, 5000));
  }

  let users;
  try {
    users = await listUsers();
  } catch (err) {
    console.error('Failed to list users:', err.message);
    process.exit(1);
  }

  const start = Date.now();
  const results = [];
  for (const u of users) {
    try {
      const r = await migrateUser(u);
      results.push(r);
      const tag = r.action === 'migrated'
        ? `✓ ${r.action.padEnd(13)} → +${r.creditsAdded} calderos (txId ${r.transactionId})`
        : r.action === 'would-migrate'
          ? `~ ${r.action.padEnd(13)} → would add ${MIGRATION_BONUS}`
          : `- ${r.action.padEnd(13)} (${r.reason || ''})`;
      console.log(`uid ${u.uid.padEnd(40)}  ${tag}`);
    } catch (err) {
      results.push({ uid: u.uid, action: 'error', error: err.message });
      console.error(`uid ${u.uid}  ✗ error: ${err.message}`);
    }
  }
  const durationMs = Date.now() - start;

  const counts = results.reduce((acc, r) => {
    acc[r.action] = (acc[r.action] || 0) + 1;
    return acc;
  }, {});

  console.log('');
  console.log('=== Summary ===');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`  Total time: ${durationMs} ms`);
  console.log('');

  if (DRY_RUN) {
    console.log('Re-run with --execute to apply the changes.');
  } else {
    console.log('Migration complete.');
  }
})().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
