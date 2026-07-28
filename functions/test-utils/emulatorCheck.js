const { execSync } = require('child_process');

/**
 * Check whether the Firestore emulator is reachable on localhost:8080.
 *
 * The functions test suite relies on FIRESTORE_EMULATOR_HOST. When the
 * emulator is not running the tests hang trying to connect, so this helper
 * lets test files short-circuit gracefully.
 *
 * Uses a synchronous child-process check because the test files are CommonJS
 * and we need to decide whether to register the real describe block before it
 * executes.
 */
function isEmulatorAvailable() {
  try {
    const script = `require('net').connect(8080,'localhost').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1)); setTimeout(()=>process.exit(1), 500);`;
    execSync(`node -e "${script}"`, { timeout: 2000, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * If the Firestore emulator is not running, register a skipped describe block
 * and return true so the caller can early-return from the test file.
 */
function skipIfEmulatorUnavailable() {
  if (!isEmulatorAvailable()) {
    const { describe, it } = require('node:test');
    describe('(skipped: emulador Firestore no disponible)', () => {
      it('emulador no disponible', { skip: true }, () => {});
    });
    return true;
  }
  return false;
}

module.exports = {
  isEmulatorAvailable,
  skipIfEmulatorUnavailable,
};
