import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

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
  const [state, setState] = useState({
    transactions: [],
    loading: uid !== null,
    error: null,
  });

  useEffect(() => {
    if (uid === null) {
      setState({ transactions: [], loading: false, error: null });
      return undefined;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnap) => {
        const transactions = querySnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toMillis?.() ?? null,
        }));
        setState({ transactions, loading: false, error: null });
      },
      (error) => {
        setState({ transactions: [], loading: false, error });
      },
    );

    return unsubscribe;
  }, [uid, maxItems]);

  return state;
}
