import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const userData = userDoc.exists() ? userDoc.data() : null
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const createUser = async (email, password, additionalData = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const userData = {
      uid: credential.user.uid,
      email,
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false,
      ...additionalData,
    }
    await setDoc(doc(db, 'users', credential.user.uid), userData)
    setUser(userData)
    return userData
  }

  const signIn = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid))
    const userData = userDoc.exists() ? userDoc.data() : null
    setUser(userData)
    return userData
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid))
    
    if (!userDoc.exists()) {
      const userData = {
        uid: credential.user.uid,
        email: credential.user.email,
        createdAt: new Date().toISOString(),
        hasCompletedOnboarding: false,
      }
      await setDoc(doc(db, 'users', credential.user.uid), userData)
      setUser(userData)
      return userData
    }
    
    const userData = userDoc.data()
    setUser(userData)
    return userData
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  const updateUser = async (data) => {
    const updatedUser = { ...user, ...data }
    await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true })
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    loading,
    createUser,
    signIn,
    signInWithGoogle,
    signOut,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}