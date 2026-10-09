#!/usr/bin/env node
/**
 * scripts/intake-legacy-users.js
 *
 * Pre-migration discovery for Sesión 3.5 (migración retroactiva de locales
 * existentes). Lists every Firebase Auth user with their provider info and
 * the shape of their users/{uid} Firestore document. Read-only — makes no
 * writes.
 *
 * Usage (from repo root):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node functions/scripts/intake-legacy-users.js
 *
 * Or in CI / local emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 \
 *   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
 *     node functions/scripts/intake-legacy-users.js
 *
 * Output: prints a structured summary to stdout — easy to redirect to a
 * file or pipe through `tee`. The script does NOT require a TTY.
 */

const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'caldero-envio';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();
const auth = admin.auth();

async function listAllUsers() {
  const out = [];
  let nextPageToken;
  do {
    const page = await auth.listUsers(1000, nextPageToken);
    out.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);
  return out;
}

function summariseProviderData(providerData) {
  // Each provider object is `{ providerId, uid, email, ... }`. firebase
  // password = 'password', Google = 'google.com', etc.
  return providerData.map((p) => p.providerId);
}

async function fetchUserDoc(uid) {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? snap.data() : null;
}

async function fetchAccountDoc(uid) {
  const snap = await db.collection('accounts').doc(uid).get();
  return snap.exists ? snap.data() : null;
}

(async () => {
  console.log('=== Legacy Users Intake ===');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST || '(none — using prod)'}`);
  console.log('');

  let users;
  try {
    users = await listAllUsers();
  } catch (err) {
    console.error('Failed to list users. Check GOOGLE_APPLICATION_CREDENTIALS.');
    console.error(err.message);
    process.exit(1);
  }

  console.log(`=== Auth Users (${users.length} total) ===\n`);
  for (const u of users) {
    const providers = summariseProviderData(u.providerData);
    const created = u.metadata?.creationTime || '(unknown)';
    const lastSignIn = u.metadata?.lastSignInTime || '(never)';
    console.log(`uid: ${u.uid}`);
    console.log(`  email:           ${u.email || '(none)'}`);
    console.log(`  displayName:     ${u.displayName || '(none)'}`);
    console.log(`  providers:       ${providers.join(', ') || '(none)'}`);
    console.log(`  emailVerified:   ${u.emailVerified}`);
    console.log(`  createdAt:       ${created}`);
    console.log(`  lastSignInAt:    ${lastSignIn}`);
    console.log(`  disabled:        ${u.disabled}`);
    console.log('');
  }

  console.log('=== users/{uid} shapes ===\n');
  for (const u of users) {
    const userDoc = await fetchUserDoc(u.uid);
    if (userDoc === null) {
      console.log(`uid: ${u.uid}  --> no users/{uid} doc (will be a no-op for schemaVersion fix)`);
    } else {
      console.log(`uid: ${u.uid}`);
      console.log('  fields:');
      for (const [key, value] of Object.entries(userDoc)) {
        const display = typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
        console.log(`    ${key}: ${display}`);
      }
    }
    console.log('');
  }

  console.log('=== accounts/{uid} shapes (migration candidates) ===\n');
  let withAccount = 0;
  let withoutAccount = 0;
  for (const u of users) {
    const acc = await fetchAccountDoc(u.uid);
    if (acc) {
      withAccount++;
      console.log(`uid: ${u.uid}  --> HAS accounts/{uid} (creditsBalance: ${acc.creditsBalance}, freeCalderosTotal: ${acc.freeCalderosTotal || '?'})`);
    } else {
      withoutAccount++;
      console.log(`uid: ${u.uid}  --> NO accounts/{uid}  *** CANDIDATE FOR MIGRATION ***`);
    }
  }
  console.log('');

  console.log('=== Summary ===');
  console.log(`Total Auth users:        ${users.length}`);
  console.log(`With accounts/{uid}:     ${withAccount}`);
  console.log(`Without accounts/{uid}:  ${withoutAccount} (migration candidates)`);
  console.log('');
  console.log('Next step: review the candidates above and run migrate-legacy-users.js when ready.');
})().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
