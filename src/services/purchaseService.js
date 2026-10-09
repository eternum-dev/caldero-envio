import { httpsCallable, httpsCallableFromURL } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Service wrappers for the caldero purchase Cloud Functions (2nd gen).
 *
 * Production (httpsCallableFromURL): 2nd gen callables run on Cloud Run
 * behind a stable `{region}-{project}.cloudfunctions.net/{functionName}`
 * endpoint. httpsCallableFromURL pins the call there.
 *
 * Emulator (httpsCallable): when `VITE_USE_FIREBASE_EMULATORS=true`, the
 * SDK resolves the function via the region from `getFunctions()` and
 * the emulator connection registered in src/config/firebase.js.
 *
 * URLs were updated after the first 2nd gen deploy to the
 * `southamerica-east1` region.
 */

const REGION = 'southamerica-east1';
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'caldero-envio';
const USE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

const PROD_BASE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

const PROD_FUNCTION_URLS = {
  createCheckoutSession: `${PROD_BASE_URL}/createCheckoutSession`,
  checkPurchaseStatus: `${PROD_BASE_URL}/checkPurchaseStatus`,
};

function prodFunctionUrl(name) {
  const url = PROD_FUNCTION_URLS[name];
  if (!url) {
    throw new Error(`Unknown function: ${name}`);
  }
  return url;
}

// In emulator mode we pin the exact URL because plain httpsCallable()
// doesn't always resolve 2nd gen function paths correctly.
const createCheckoutSessionCallable = USE_EMULATORS
  ? httpsCallableFromURL(functions, `http://localhost:5001/${PROJECT_ID}/${REGION}/createCheckoutSession`)
  : httpsCallableFromURL(functions, prodFunctionUrl('createCheckoutSession'));

const checkPurchaseStatusCallable = USE_EMULATORS
  ? httpsCallableFromURL(functions, `http://localhost:5001/${PROJECT_ID}/${REGION}/checkPurchaseStatus`)
  : httpsCallableFromURL(functions, prodFunctionUrl('checkPurchaseStatus'));

/**
 * Start a checkout session for a caldero package.
 *
 * @param {string} packageId
 * @returns {Promise<{init_point: string, purchase_id: string, external_reference: string}>}
 */
export async function createCheckoutSession(packageId) {
  const { data } = await createCheckoutSessionCallable({ packageId });
  return data;
}

/**
 * Check the status of a purchase after returning from the MP checkout.
 *
 * The optional `mockAction` parameter is only used when the backend is running
 * in mock mode; it lets the frontend drive the simulated payment outcome so the
 * mock E2E flow can be tested without real MP credentials.
 *
 * @param {string} purchaseId
 * @param {'approved' | 'rejected' | 'pending'} [mockAction]
 * @returns {Promise<{status: string, balance?: number, packageId?: string}>}
 */
export async function checkPurchaseStatus(purchaseId, mockAction) {
  const { data } = await checkPurchaseStatusCallable({
    purchaseId,
    mockAction,
  });
  return data;
}

/**
 * Predicate that detects a mock checkout URL returned by MockMercadoPagoClient.
 *
 * @param {string} initPoint
 * @returns {boolean}
 */
export function isMockCheckoutUrl(initPoint) {
  return typeof initPoint === 'string' && initPoint.includes('mock.mercadopago.com');
}

/**
 * Navigation helper for the post-checkout redirect.
 *
 * In mock mode we stay in-app and show the mock checkout modal. In real mode
 * we redirect to the MP init_point URL.
 *
 * @param {string} initPoint
 * @returns {string | null} null when the URL should be handled in-app
 */
export function getCheckoutRedirectUrl(initPoint) {
  if (isMockCheckoutUrl(initPoint)) {
    return null;
  }
  return initPoint;
}

export default {
  createCheckoutSession,
  checkPurchaseStatus,
  isMockCheckoutUrl,
  getCheckoutRedirectUrl,
};
