import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [couriers, setCouriers] = useState([]);
  // loading starts as true so the first render shows skeleton (we don't
  // know yet if the user has a store). The useEffect below sets it to
  // false once Firestore responds (or the 5s safety timeout fires).
  // We could NOT start with false + null because the App.jsx and
  // Settings.jsx show an "empty state" (you need to set up your store)
  // when store is null, which would flash on every page load.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setStore(null);
      setCouriers([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Safety timeout: same pattern as in useCredits/useTransactions.
    // If Firestore doesn't respond within 5s, force loading=false so the
    // UI doesn't get stuck on skeleton forever. Important for this
    // context in particular because the page-level consumers (App.jsx,
    // Settings.jsx) branch on `loading` vs `!store`, and a stuck
    // loading=true hides the entire app UI.
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const storeUnsubscribe = onSnapshot(
      doc(db, 'stores', user.uid),
      doc => {
        if (doc.exists()) {
          setStore({ id: doc.id, ...doc.data() });
        } else {
          // store doesn't exist yet — user is new and hasn't done onboarding.
          // setStore(null) triggers the "you need to set up your store"
          // empty state in consumers.
          setStore(null);
        }
        setLoading(false);
      },
      (err) => {
        // Error handler added after the original "load forever" bug.
        // Before this, an onSnapshot error would never trigger any
        // setState, leaving loading=true forever. Now we set error and
        // force loading=false so the UI is always recoverable.
        // eslint-disable-next-line no-console
        console.error('[StoreContext] stores read error:', err);
        setError(err);
        setLoading(false);
      },
    );

    const couriersUnsubscribe = onSnapshot(
      doc(db, 'couriers', user.uid),
      doc => {
        if (doc.exists()) {
          setCouriers(doc.data().list || []);
        } else {
          setCouriers([]);
        }
      },
      // Couriers read error: we don't setError for this one (store error
      // is more critical for UX). Just log so devs can see it in console.
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[StoreContext] couriers read error:', err);
      },
    );

    return () => {
      clearTimeout(safetyTimeout);
      storeUnsubscribe();
      couriersUnsubscribe();
    };
  }, [user?.uid]);

  const saveStore = async storeData => {
    await setDoc(doc(db, 'stores', user.uid), { ...storeData, schemaVersion: 1 }, { merge: true });
  };

  const saveCouriers = async couriersList => {
    await setDoc(doc(db, 'couriers', user.uid), { list: couriersList, schemaVersion: 1 }, { merge: true });
  };

  const addCourier = async courier => {
    const newCourier = {
      // Date.now() is a quick unique-ish ID. If we need stronger
      // uniqueness later, switch to nanoid (already a dep).
      id: Date.now().toString(),
      name: courier.name,
      phone: courier.phone,
      createdAt: new Date().toISOString(),
    };
    const updatedCouriers = [...couriers, newCourier];
    await saveCouriers(updatedCouriers);
    return newCourier;
  };

  const removeCourier = async courierId => {
    const updatedCouriers = couriers.filter(c => c.id !== courierId);
    await saveCouriers(updatedCouriers);
  };

  const updateCourier = async (courierId, data) => {
    const updatedCouriers = couriers.map(c =>
      c.id === courierId ? { ...c, ...data } : c
    );
    await saveCouriers(updatedCouriers);
  };

  const savePricingRules = async rules => {
    await setDoc(doc(db, 'stores', user.uid), { pricingRules: rules, schemaVersion: 1 }, { merge: true });
  };

  const value = {
    store,
    couriers,
    loading,
    error,
    saveStore,
    addCourier,
    removeCourier,
    updateCourier,
    saveCouriers,
    savePricingRules,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
