import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore as _getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { isSupported as analyticsSupported, getAnalytics, type Analytics } from 'firebase/analytics'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

function unconfiguredStub<T extends object>(label: string): T {
  const msg = `[Firebase] ${label} 에 접근했지만 환경변수가 설정되지 않았습니다. Vercel 프로젝트 설정에 NEXT_PUBLIC_FIREBASE_* 값을 추가하세요.`
  return new Proxy({} as T, {
    get() {
      throw new Error(msg)
    },
    apply() {
      throw new Error(msg)
    },
  })
}

let cachedApp: FirebaseApp | null = null
let cachedAuth: Auth | null = null
let cachedFirestore: Firestore | null = null
let cachedStorage: FirebaseStorage | null = null

function resolveApp(): FirebaseApp {
  if (cachedApp) return cachedApp
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return cachedApp
}

export const firebaseApp: FirebaseApp = isFirebaseConfigured
  ? resolveApp()
  : unconfiguredStub<FirebaseApp>('firebaseApp')

export const firebaseAuth: Auth = isFirebaseConfigured
  ? (cachedAuth ??= getAuth(resolveApp()))
  : unconfiguredStub<Auth>('firebaseAuth')

export const firestore: Firestore = isFirebaseConfigured
  ? (cachedFirestore ??= _getFirestore(resolveApp()))
  : unconfiguredStub<Firestore>('firestore')

export const firebaseStorage: FirebaseStorage = isFirebaseConfigured
  ? (cachedStorage ??= getStorage(resolveApp()))
  : unconfiguredStub<FirebaseStorage>('firebaseStorage')

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null
  if (!isFirebaseConfigured) return null
  if (!firebaseConfig.measurementId) return null
  if (!(await analyticsSupported())) return null
  return getAnalytics(resolveApp())
}

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  return signInWithPopup(firebaseAuth, googleProvider)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  if (displayName) {
    await updateProfile(cred.user, { displayName })
  }
  return cred
}

export async function signOutFirebase() {
  return firebaseSignOut(firebaseAuth)
}

export type { User }
