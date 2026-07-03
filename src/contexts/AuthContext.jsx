import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists ? userDoc.data() : null;
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUser = async (email, password, additionalData = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Server-side atomic creation of user profile, account balance and free grant.
    // If the account already has a free grant (e.g. session restored after a stale
    // signup attempt), we tolerate `already-exists` and continue — same as
    // signInWithGoogle for returning users. Any other error is propagated.
    const createAccountWithFreeTier = httpsCallable(functions, 'createAccountWithFreeTier');
    try {
      await createAccountWithFreeTier({ email, ...additionalData });
    } catch (error) {
      if (error.code !== 'already-exists') {
        throw error;
      }
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = {
      uid,
      email,
      ...(userDoc.exists ? userDoc.data() : {}),
      ...additionalData,
    };
    setUser(userData);
    return userData;
  };

  const signIn = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    const userData = userDoc.exists ? userDoc.data() : null;
    setUser(userData);
    return userData;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const uid = credential.user.uid;
    const email = credential.user.email;

    // Attempt to grant the free tier atomically server-side. If the account
    // already exists (returning user) we ignore the error and keep going.
    const createAccountWithFreeTier = httpsCallable(functions, 'createAccountWithFreeTier');
    try {
      await createAccountWithFreeTier({ email });
    } catch (error) {
      if (error.code !== 'already-exists') {
        throw error;
      }
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = {
      uid,
      email,
      ...(userDoc.exists ? userDoc.data() : { hasCompletedOnboarding: false, schemaVersion: 1 }),
    };
    setUser(userData);
    return userData;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateUser = async data => {
    const updatedUser = { ...user, schemaVersion: 1, ...data };
    await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    loading,
    createUser,
    signIn,
    signInWithGoogle,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
