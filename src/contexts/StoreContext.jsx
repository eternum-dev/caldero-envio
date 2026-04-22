import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    if (!user?.uid) {
      setStore(null);
      setCouriers([]);
      setLoading(false);
      return;
    }

    const storeUnsubscribe = onSnapshot(doc(db, 'stores', user.uid), doc => {
      if (doc.exists()) {
        setStore({ id: doc.id, ...doc.data() });
      } else {
        setStore(null);
      }
      setLoading(false);
    });

    const couriersUnsubscribe = onSnapshot(doc(db, 'couriers', user.uid), doc => {
      if (doc.exists()) {
        setCouriers(doc.data().list || []);
      } else {
        setCouriers([]);
      }
    });

    return () => {
      storeUnsubscribe();
      couriersUnsubscribe();
    };
  }, [user?.uid]);

  const saveStore = async storeData => {
    await setDoc(doc(db, 'stores', user.uid), storeData, { merge: true });
  };

  const saveCouriers = async couriersList => {
    await setDoc(doc(db, 'couriers', user.uid), { list: couriersList }, { merge: true });
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

  const value = {
    store,
    couriers,
    loading,
    saveStore,
    addCourier,
    removeCourier,
    saveCouriers,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
