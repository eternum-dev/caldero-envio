const admin = require('firebase-admin');

/**
 * firebase-admin initialization shim.
 *
 * In production Cloud Functions (gen 1 or gen 2), the Admin SDK is
 * auto-initialized by the Functions runtime with default credentials.
 * Calling `initializeApp()` again raises
 *   "The default Firebase app does not exist" only on the emulator,
 * where there is no auto-init.
 *
 * We therefore only call `initializeApp()` when we detect the emulator
 * (FIRESTORE_EMULATOR_HOST is set) AND no app exists yet. The guard
 * avoids re-initialization in unit tests that pre-initialize the SDK.
 */
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
if (isEmulator && admin.apps.length === 0) {
  admin.initializeApp();
}

module.exports = admin;