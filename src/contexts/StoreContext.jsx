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

    // Safety timeout: 5s maximos para que onSnapshot responda. Si no llega,
    // forzar loading=false para que la UI no se quede en skeleton infinito.
    const safetyTimeout = setTimeout(() => {
      setLoading((current) =>
        current
          ? { /* noop */ }
          : current,
      );
      setLoading(false);
    }, 5000);

    const storeUnsubscribe = onSnapshot(
      doc(db, 'stores', user.uid),
      doc => {
        if (doc.exists()) {
          setStore({ id: doc.id, ...doc.data() });
        } else {
          setStore(null);
        }
        setLoading(false);
      },
      (err) => {
        // Error handler explicito: antes el error se ignoraba y loading
        // quedaba en true para siempre. Ahora forzamos loading=false
        // y guardamos el error para mostrar en consola / UI.
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
