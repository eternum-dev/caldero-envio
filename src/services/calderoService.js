import { httpsCallable, httpsCallableFromURL } from 'firebase/functions';
import { nanoid } from 'nanoid';
import { functions } from '../config/firebase';

/**
 * Service wrapper for the caldero-spending Cloud Function (2nd gen).
 *
 * Production (httpsCallableFromURL): 2nd gen callables run on Cloud Run
 * behind a stable `{region}-{project}.cloudfunctions.net/{functionName}`
 * endpoint. httpsCallableFromURL pins the call there.
 *
 * Emulator (httpsCallable): when `VITE_USE_FIREBASE_EMULATORS=true`, the
 * frontend points at the local Firebase emulator (port 5001) and the
 * function name itself is enough for the SDK to resolve the URL — it
 * uses the region from `getFunctions()` (southamerica-east1) and the
 * emulator connection registered in src/config/firebase.js.
 *
 * URL was added in feature/deduccion-y-migracion-3.5 — needs to be
 * deployed to southamerica-east1 before the frontend can call it in
 * production.
 */

const REGION = 'southamerica-east1';
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'caldero-envio';
const USE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

const PROD_SPEND_CALDERO_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/spendCaldero`;

const spendCalderoCallable = USE_EMULATORS
  ? httpsCallable(functions, 'spendCaldero')
  : httpsCallableFromURL(functions, PROD_SPEND_CALDERO_URL);

/**
 * Atomically debit 1 caldero from the current user's balance and record
 * a deduction transaction.
 *
 * Pass a fresh idempotency key on every attempt. If the call fails due
 * to a network blip and the user retries (or our caller retries), the
 * backend will see the existing transaction with this key and return
 * the same result without applying a second debit.
 *
 * @param {string} [idempotencyKey] - Optional. If omitted, a new nanoid(12) is generated.
 * @returns {Promise<{success: boolean, balanceAfter: number, transactionId: string, idempotent: boolean}>}
 */
export async function spendCaldero(idempotencyKey) {
  const key = idempotencyKey || nanoid(12);
  const { data } = await spendCalderoCallable({ idempotencyKey: key });
  return data;
}

export default { spendCaldero };
