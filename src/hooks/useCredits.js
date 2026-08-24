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
 * Why useSyncExternalStore + a custom store instead of useState + useEffect?
 * The naive pattern is:
 *   const [balance, setBalance] = useState(0);
 *   useEffect(() => {
 *     const unsub = onSnapshot(doc(db, 'accounts', uid),
 *       snap => setBalance(snap.data()?.creditsBalance ?? 0));
 *     return unsub;
 *   }, [uid]);
 *
 * That pattern has 3 problems this implementation avoids:
 * 1. setState in useEffect triggers a re-render even when the data
 *    didn't change, causing render loops in some edge cases.
 * 2. Concurrent mode (React 18) might tear the subscription if the
 *    component is interrupted mid-effect. useSyncExternalStore is designed
 *    for this.
 * 3. When uid changes, there's a moment between the previous unsub
 *    and the new sub where the component shows stale data. Our
 *    uid-keyed useMemo creates a fresh store with loading=true for
 *    the new uid, so the UI shows "loading" instead of stale data.
 *
 * The 5s safety timeout (in createCreditsStore.subscribe) is a backstop:
 * if Firestore never responds, we force loading=false with an error
 * so the UI doesn't get stuck on skeleton forever. This was added after
 * we hit the infinite-skeleton bug in Session 4 testing.
 *
 * @param {string | null} uid
 * @returns {{ balance: number, loading: boolean, error: Error | null }}
 */
export function useCredits(uid) {
  // uid-keyed memo: when the user logs out (uid → null) or switches
  // accounts, we create a fresh store with loading=true. The old store
  // gets garbage collected.
  const store = useMemo(() => createCreditsStore(uid), [uid]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    // Server snapshot (used during SSR, which we don't do, but React
    // requires this function to exist). Returns safe defaults.
    () => ({ balance: 0, loading: false, error: null }),
  );
}
