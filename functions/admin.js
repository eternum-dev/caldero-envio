const admin = require('firebase-admin');

/**
 * Lazy firebase-admin initialization.
 *
 * In production Cloud Functions (1st gen AND 2nd gen), the Admin SDK is
 * auto-initialized by the Functions runtime with the project's default
 * service account. So calling `initializeApp()` again would be a no-op
 * that might even fail (if no default credentials exist).
 *
 * The local emulator does NOT auto-initialize. If we call
 * `admin.firestore()` without initializing first, we get
 *   "The default Firebase app does not exist."
 * which is what bit us in Session 3 debugging.
 *
 * The `isEmulator` check + `apps.length === 0` guard gives us:
 * - In prod: skip (already auto-initialized)
 * - In emulator: initialize once, reuse on subsequent calls
 * - In tests: skip (test sets up its own projectId via admin.initializeApp)
 *
 * Important: do NOT call `admin.initializeApp()` unconditionally. If we
 * did, and the production runtime already initialized the app, our second
 * call would either fail or create a second app that we'd need to
 * manage. The `apps.length === 0` check is the only safe gate.
 */
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
if (isEmulator && admin.apps.length === 0) {
  admin.initializeApp();
}

module.exports = admin;
