const admin = require('firebase-admin');

/**
 * Lazy firebase-admin initialization.
 *
 * Cloud Functions 1st gen auto-initializes the Admin SDK, so
 * `apps.length > 0` and we skip. Cloud Functions 2nd gen (Cloud Run)
 * does NOT auto-initialize; if we call `admin.firestore()` without
 * initializing first, we get:
 *   "The default Firebase app does not exist."
 *
 * The local emulator also does NOT auto-initialize, so we need to
 * initialize there too.
 *
 * The `apps.length === 0` guard makes the call idempotent:
 * - In 1st gen prod: skip (already auto-initialized)
 * - In 2nd gen prod: initialize once, reuse on subsequent calls
 * - In emulator: initialize once, reuse on subsequent calls
 * - In tests: skip (test sets up its own projectId via admin.initializeApp)
 */
if (admin.apps.length === 0) {
  admin.initializeApp();
}

module.exports = admin;
