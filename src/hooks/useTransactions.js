import { useMemo, useSyncExternalStore } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

function createTransactionsStore(uid, maxItems) {
  let snapshot = { transactions: [], loading: uid !== null, error: null };
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
    const timeoutId = setTimeout(() => {
      setSnapshot((current) =>
        current.loading
          ? { transactions: [], loading: false, error: new Error('Firestore read timed out') }
          : current,
      );
    }, 5000);

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnap) => {
        clearTimeout(timeoutId);
        const transactions = querySnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toMillis?.() ?? null,
        }));
        setSnapshot({ transactions, loading: false, error: null });
      },
      (error) => {
        clearTimeout(timeoutId);
        setSnapshot({ transactions: [], loading: false, error });
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
 * Hook: useTransactions
 *
 * Observes the real-time transaction history for a given user.
 *
 * @param {string | null} uid
 * @param {number} maxItems
 * @returns {{ transactions: Array<object>, loading: boolean, error: Error | null }}
 */
export function useTransactions(uid, maxItems = 10) {
  const store = useMemo(() => createTransactionsStore(uid, maxItems), [uid, maxItems]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => ({ transactions: [], loading: false, error: null }),
  );
}
