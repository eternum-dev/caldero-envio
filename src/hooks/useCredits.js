import { useMemo, useSyncExternalStore } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

function createCreditsStore(uid) {
  let snapshot = { balance: 0, loading: uid !== null, error: null };
  const listeners = new Set();

  function notify() {
    listeners.forEach(cb => cb());
  }

  function setSnapshot(next) {
    snapshot = next;
    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);

    if (!uid) {
      return () => listeners.delete(listener);
    }

    // Safety timeout: if Firestore doesn't respond within 5s, treat as
    // "no data" and stop the skeleton so the UI is always responsive.
    // This protects against stuck onSnapshot subscriptions, slow networks,
    // and rule misconfigurations that would otherwise hang the UI forever.
    const timeoutId = setTimeout(() => {
      setSnapshot((current) =>
        current.loading
          ? { balance: 0, loading: false, error: new Error('Firestore read timed out') }
          : current,
      );
    }, 5000);

    const unsubscribe = onSnapshot(
      doc(db, 'accounts', uid),
      (docSnap) => {
        clearTimeout(timeoutId);
        const data = docSnap.exists ? docSnap.data() : null;
        setSnapshot({
          balance: data?.creditsBalance ?? 0,
          loading: false,
          error: null,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        setSnapshot({ balance: 0, loading: false, error });
      },
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      listeners.delete(listener);
    };
  }

  function getSnapshot() {
    return snapshot;
  }

  return { subscribe, getSnapshot };
}

/**
 * Hook: useCredits
 *
 * Observes the real-time caldero balance for a given user.
 *
 * @param {string | null} uid
 * @returns {{ balance: number, loading: boolean, error: Error | null }}
 */
export function useCredits(uid) {
  const store = useMemo(() => createCreditsStore(uid), [uid]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => ({ balance: 0, loading: false, error: null }),
  );
}
