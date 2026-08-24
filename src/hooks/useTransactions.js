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

    // Safety timeout: same rationale as in useCredits.js — prevents
    // infinite skeleton if Firestore never responds.
    const timeoutId = setTimeout(() => {
      setSnapshot((current) =>
        current.loading
          ? { transactions: [], loading: false, error: new Error('Firestore read timed out') }
          : current,
      );
    }, 5000);

    // Query shape: a user's transactions, most recent first, capped at
    // maxItems. The (uid, createdAt desc) compound index lives in
    // firestore.indexes.json — without it Firestore would error at
    // query time with "The query requires an index".
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
        // createdAt is a Firestore Timestamp; .toMillis() converts to JS
        // number (ms since epoch) for easy sorting/display downstream.
        // The fallback (null) keeps the contract consistent even if
        // the field is somehow missing.
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
 * Cost consideration: each call to this hook opens a Firestore listener.
 * Callers should pass a sensible `maxItems` (default 10) to bound the
 * read. If a screen needs more, paginate explicitly rather than
 * increasing the limit.
 *
 * @param {string | null} uid
 * @param {number} maxItems
 * @returns {{ transactions: Array<object>, loading: boolean, error: Error | null }}
 */
export function useTransactions(uid, maxItems = 10) {
  // Both uid and maxItems are deps: changing either creates a new
  // Firestore query (and thus a new store). The cleanup in subscribe's
  // return function unsubscribes the old query.
  const store = useMemo(() => createTransactionsStore(uid, maxItems), [uid, maxItems]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => ({ transactions: [], loading: false, error: null }),
  );
}
