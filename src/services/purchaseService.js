import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Service wrappers for the caldero purchase Cloud Functions.
 *
 * All functions are callable against the southamerica-west1 region configured
 * in src/config/firebase.js.
 *
 * Swap path to real MercadoPago:
 *   1. Set MP_ACCESS_TOKEN and MP_WEBHOOK_SECRET via Firebase secrets.
 *   2. Set MP_APP_URL to the production hosting URL.
 *   3. The factory in functions/mercadopago.js will automatically switch from
 *      MockMercadoPagoClient to the real SDK.
 */

const createCheckoutSessionCallable = httpsCallable(
  functions,
  'createCheckoutSession',
);
const checkPurchaseStatusCallable = httpsCallable(
  functions,
  'checkPurchaseStatus',
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
