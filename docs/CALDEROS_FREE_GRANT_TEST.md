# Manual Test Plan — Calderos Free Grant

> Change: `revisar-monetizacion` · Session 1 · Feature: free 10-caldero grant on signup
> Scope: end-to-end validation using Firebase Emulators

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```
2. Java 11+ available (required by Firestore emulator).
3. Env file `.env` with Firebase configuration values.

## Start emulators

```bash
npx firebase emulators:start --only auth,functions,firestore --project caldero-envio-test
```

Keep this terminal open.

## Scenario 1 — Happy path: new user receives 10 calderos

1. Open the Emulator Suite UI (URL printed in the terminal, usually `http://127.0.0.1:4000`) or use the web app at `http://localhost:5173`.
2. In the app, navigate to **Register** and create a new account with email + password.
3. Wait for the redirect to `/onboarding` or `/app`.
4. In the Emulator Suite, open **Firestore** and verify:
   - `users/{uid}` exists with `uid`, `email`, `hasCompletedOnboarding: false`, `schemaVersion: 1`.
   - `accounts/{uid}` exists with:
     - `creditsBalance: 10`
     - `freeCalderosUsed: 0`
     - `freeCalderosTotal: 10`
     - `lifetimeCredits: 10`
     - `currency: 'CLP'`
     - `schemaVersion: 1`
     - `totalTopUps: 0`
   - `transactions/{txId}` exists with:
     - `uid: {uid}`
     - `type: 'free'`
     - `amount: 10`
     - `balanceAfter: 10`
     - `externalReference: 'free-grant-{uid}'`
     - `packageId: null`
     - `metadata.source: 'signup'`
5. If the header displays the credit badge, confirm it shows **10 calderos**.

## Scenario 2 — Idempotency: registering twice with the same UID

1. Use the same user created in Scenario 1.
2. Trigger the free grant again manually via the JS console or a temporary UI button:
   ```js
   import { httpsCallable } from 'firebase/functions';
   import { functions } from './src/config/firebase';
   const fn = httpsCallable(functions, 'createAccountWithFreeTier');
   await fn({ email: 'same-user@example.com' });
   ```
3. Expected result: the callable returns an `already-exists` error and **no new** `transactions` document is created.
4. Verify in the Emulator Suite:
   - `accounts/{uid}.creditsBalance` is still **10** (not 20).
   - Only **one** transaction with `externalReference: 'free-grant-{uid}'` exists.

## Scenario 3 — Failure simulation: CF unavailable mid-flow

1. Stop the Functions emulator (`Ctrl+C` on the emulator terminal, or kill only the functions process).
2. Try to register a new user in the app.
3. Expected result: Firebase Auth creates the user, but the app shows an error from `createAccountWithFreeTier` and the user is **not** created in `users/{uid}` nor `accounts/{uid}`.
4. Restart the Functions emulator and retry registration with the same email (or a new one).
5. Expected result: the retry succeeds and the new user receives 10 calderos.

## Scenario 4 — Google sign-in returning user

1. Enable Google sign-in in the Auth emulator (or use the real Auth provider in a staging project).
2. Sign in with Google for the first time; verify the free grant documents are created.
3. Sign out and sign in again with the same Google account.
4. Expected result: the second sign-in succeeds, the `already-exists` error is silently ignored, and the account balance does **not** change.

## QA Checklist

- [ ] New email/password user gets `accounts/{uid}.creditsBalance == 10`.
- [ ] A `transactions` document with `type: 'free'` and `amount: 10` is created.
- [ ] Re-triggering the CF for the same UID returns `already-exists` and does not duplicate the transaction.
- [ ] CF failure during registration leaves `users/{uid}` and `accounts/{uid}` empty.
- [ ] Google sign-in returning user does not lose or duplicate calderos.
- [ ] Header badge (if visible) reflects the balance without a page reload.

## Notes

- The free grant is intentionally server-side to keep `accounts/{uid}` write-protected by Firestore security rules.
- All Cloud Functions run in `southamerica-west1`; ensure the frontend `src/config/firebase.js` is pinned to the same region.
