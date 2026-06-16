import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

const PROJECT_ID = 'caldero-envio-rules-test';

/** @type {import('@firebase/rules-unit-testing').RulesTestEnvironment} */
let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ── Helpers ──────────────────────────────────

const UID = 'user_123';
const OTHER_UID = 'user_456';

function ownerDb() {
  return testEnv.authenticatedContext(UID).firestore();
}

function anonDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ── Users collection ─────────────────────────

describe('users/{userId}', () => {
  it('1. Owner can read own user document', async () => {
    // Seed data with rules disabled
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc(UID).set({
        uid: UID,
        email: 'owner@test.com',
        createdAt: Date.now(),
      });
    });

    await assertSucceeds(ownerDb().collection('users').doc(UID).get());
  });

  it('2. Owner can create user document with required fields', async () => {
    await assertSucceeds(
      ownerDb().collection('users').doc(UID).set({
        uid: UID,
        email: 'owner@test.com',
        createdAt: Date.now(),
      }),
    );
  });

  it('3. Non-owner cannot read another user document', async () => {
    // Seed data with rules disabled
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc(OTHER_UID).set({
        uid: OTHER_UID,
        email: 'other@test.com',
        createdAt: Date.now(),
      });
    });

    await assertFails(ownerDb().collection('users').doc(OTHER_UID).get());
  });

  it('4. Non-owner cannot write another user document', async () => {
    await assertFails(
      ownerDb().collection('users').doc(OTHER_UID).set({
        uid: OTHER_UID,
        email: 'intruder@test.com',
        createdAt: Date.now(),
      }),
    );
  });

  it('5. Owner cannot change uid on update', async () => {
    // Seed data with rules disabled
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc(UID).set({
        uid: UID,
        email: 'owner@test.com',
        createdAt: Date.now(),
      });
    });

    // Update that tries to change uid — should fail
    await assertFails(
      ownerDb()
        .collection('users')
        .doc(UID)
        .update({ uid: 'tampered_uid' }),
    );
  });
});

// ── Anonymous access ─────────────────────────

describe('Anonymous users blocked from all collections', () => {
  it('6. Anonymous user cannot read any user document', async () => {
    await assertFails(anonDb().collection('users').doc(UID).get());
  });

  it('6b. Anonymous user cannot write to users', async () => {
    await assertFails(
      anonDb().collection('users').doc('anyone').set({
        uid: 'anyone',
        email: 'anon@test.com',
        createdAt: Date.now(),
      }),
    );
  });

  it('6c. Anonymous user cannot read from stores', async () => {
    await assertFails(anonDb().collection('stores').doc(UID).get());
  });
});

// ── Accounts collection ──────────────────────

describe('accounts/{userId}', () => {
  it('7. Owner can read own account balance', async () => {
    // Seed data with rules disabled
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('accounts').doc(UID).set({
        balance: 1000,
        currency: 'COP',
      });
    });

    await assertSucceeds(
      ownerDb().collection('accounts').doc(UID).get(),
    );
  });

  it('8. Owner cannot write to accounts (server-only)', async () => {
    await assertFails(
      ownerDb().collection('accounts').doc(UID).set({
        balance: 9999,
      }),
    );

    await assertFails(
      ownerDb().collection('accounts').doc(UID).update({ balance: 9999 }),
    );
  });
});

// ── Stores collection ────────────────────────

describe('stores/{userId}', () => {
  it('9. Owner can read own store (via get — equivalent to onSnapshot)', async () => {
    // Seed data with rules disabled
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('stores').doc(UID).set({
        name: 'My Store',
        city: 'Bogota',
      });
    });

    // onSnapshot subscription is not directly testable with this library,
    // but permission rules for get() and onSnapshot() are identical in
    // Firestore security rules — if get() passes, onSnapshot will too.
    await assertSucceeds(
      ownerDb().collection('stores').doc(UID).get(),
    );
  });
});

// ── Couriers collection ──────────────────────

describe('couriers/{userId}', () => {
  it('10. Owner can write own couriers', async () => {
    await assertSucceeds(
      ownerDb().collection('couriers').doc(UID).set({
        name: 'Courier One',
        phone: '3001234567',
      }),
    );

    // Also test update
    await assertSucceeds(
      ownerDb().collection('couriers').doc(UID).update({
        phone: '3007654321',
      }),
    );
  });
});