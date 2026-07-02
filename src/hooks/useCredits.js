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

    const unsubscribe = onSnapshot(
      doc(db, 'accounts', uid),
      (docSnap) => {
        const data = docSnap.exists ? docSnap.data() : null;
        setSnapshot({
          balance: data?.creditsBalance ?? 0,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setSnapshot({ balance: 0, loading: false, error });
      },
    );

    return () => {
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
