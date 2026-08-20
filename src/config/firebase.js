import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Pin callable functions to southamerica-west1 (Santiago, Chile) to match
// Firestore region and reduce latency for Chilean users. Resolved in design v2 OQ-1.
export const functions = getFunctions(app, 'us-central1');

// Connect to local Firebase emulators when explicitly enabled. This is opt-in
// (VITE_USE_FIREBASE_EMULATORS=true) to keep production behavior untouched
// and to avoid double-connection warnings during Vite HMR in development.
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
if (useEmulators && typeof window !== 'undefined') {
  // The emulator connections must run only once per app instance. Guard against
  // Vite HMR re-executing this module.
  if (!window.__firebaseEmulatorsConnected) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    window.__firebaseEmulatorsConnected = true;
  }
}

export default app;
