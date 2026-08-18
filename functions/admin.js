const admin = require('firebase-admin');

/**
 * Lazy firebase-admin initialization.
 *
 * In production Cloud Functions, the Admin SDK is auto-initialized by the
 * Functions runtime. In the local emulator there is no auto-init, so we
 * must call `initializeApp()` before any `admin.firestore()` / `admin.auth()`
 * call. The `apps.length === 0` guard avoids re-initialization when this
 * module is required multiple times (e.g. unit tests that pre-initialize
 * the SDK with a specific projectId).
 */
if (admin.apps.length === 0) {
  admin.initializeApp();
}

module.exports = admin;
