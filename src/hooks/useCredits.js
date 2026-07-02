import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Hook: useCredits
 *
 * Observes the real-time caldero balance for a given user.
 *
 * @param {string | null} uid
 * @returns {{ balance: number, loading: boolean, error: Error | null }}
 */
export function useCredits(uid) {
  const [state, setState] = useState({
    balance: 0,
    loading: uid !== null,
    error: null,
  });

  useEffect(() => {
    if (uid === null) {
      setState({ balance: 0, loading: false, error: null });
      return undefined;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const unsubscribe = onSnapshot(
      doc(db, 'accounts', uid),
      (docSnap) => {
        const data = docSnap.exists ? docSnap.data() : null;
        setState({
          balance: data?.creditsBalance ?? 0,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({ balance: 0, loading: false, error });
      },
    );

    return unsubscribe;
  }, [uid]);

  return state;
}
