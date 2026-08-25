import { httpsCallableFromURL } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Service wrappers for the caldero purchase Cloud Functions (2nd gen).
 *
 * 2nd gen callables run on Cloud Run behind the same
 * `{region}-{project}.cloudfunctions.net/{functionName}` HTTPS endpoint. We use
 * httpsCallableFromURL so the JS SDK calls the correct endpoint regardless of
 * the region configured in src/config/firebase.js.
 *
 * URLs below were updated after the first 2nd gen deploy to the
 * `southamerica-east1` region.
 */

const REGION = 'southamerica-east1';
const PROJECT_ID = 'caldero-envio';
const FUNCTION_BASE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

const FUNCTION_URLS = {
  createCheckoutSession: `${FUNCTION_BASE_URL}/createCheckoutSession`,
  checkPurchaseStatus: `${FUNCTION_BASE_URL}/checkPurchaseStatus`,
};

function getFunctionUrl(name) {
  const url = FUNCTION_URLS[name];
  if (!url) {
    throw new Error(`Unknown function: ${name}`);
  }
  return url;
}

const createCheckoutSessionCallable = httpsCallableFromURL(
  functions,
  getFunctionUrl('createCheckoutSession'),
);
const checkPurchaseStatusCallable = httpsCallableFromURL(
  functions,
  getFunctionUrl('checkPurchaseStatus'),
);

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
