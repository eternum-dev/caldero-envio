import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export async function saveStore(userId, storeData) {
  await setDoc(doc(db, 'stores', userId), {
    ...storeData,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export async function getStore(userId) {
  const docSnap = await getDoc(doc(db, 'stores', userId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

export async function saveCouriers(userId, couriers) {
  await setDoc(doc(db, 'couriers', userId), {
    list: couriers,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export async function getCouriers(userId) {
  const docSnap = await getDoc(doc(db, 'couriers', userId))
  if (docSnap.exists()) {
    return docSnap.data().list || []
  }
  return []
}

export async function savePricingRules(userId, rules) {
  await setDoc(doc(db, 'stores', userId), {
    pricingRules: rules,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}