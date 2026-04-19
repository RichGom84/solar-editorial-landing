import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { firestore } from './firebase'

export type Role = 'USER' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'FAILED'

export interface UserDoc {
  uid: string
  email: string | null
  name: string | null
  role: Role
  phone?: string | null
  image?: string | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ProductDoc {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
  isActive: boolean
  sortOrder: number
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface OrderDoc {
  id: string
  userId: string
  userEmail?: string | null
  userName?: string | null
  productId: string
  productName?: string | null
  amount: number
  status: OrderStatus
  paymentKey?: string | null
  orderId: string
  method?: string | null
  approvedAt?: Timestamp | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ConsultationDoc {
  id: string
  userId?: string | null
  name: string
  phone: string
  region: string
  buildingType: string
  monthlyBill?: string | null
  message?: string | null
  status: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ReviewDoc {
  id: string
  productId: string
  orderId: string
  userId: string
  userName?: string | null
  userImage?: string | null
  rating: number
  text: string
  images: string[]
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export const COLLECTIONS = {
  users: 'users',
  products: 'products',
  orders: 'orders',
  consultations: 'consultations',
  reviews: 'reviews',
} as const

function withId<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...(snap.data() as object) } as T
}

// ===== Users =====
export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const ref = doc(firestore, COLLECTIONS.users, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { uid, ...(snap.data() as object) } as UserDoc
}

export async function upsertUserDoc(uid: string, data: Partial<UserDoc>) {
  const ref = doc(firestore, COLLECTIONS.users, uid)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, {
      role: 'USER' as Role,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function listUsers(): Promise<UserDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.users), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as object) } as UserDoc))
}

export async function updateUserRole(uid: string, role: Role) {
  await updateDoc(doc(firestore, COLLECTIONS.users, uid), { role, updatedAt: serverTimestamp() })
}

// ===== Products =====
export async function listProducts(): Promise<ProductDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.products), orderBy('sortOrder', 'asc')))
  return snap.docs.map((d) => withId<ProductDoc>(d))
}

export async function getProduct(id: string): Promise<ProductDoc | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.products, id))
  if (!snap.exists()) return null
  return withId<ProductDoc>(snap)
}

// ===== Orders =====
export async function createOrder(data: Omit<OrderDoc, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(firestore, COLLECTIONS.orders), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function listOrders(): Promise<OrderDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.orders), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => withId<OrderDoc>(d))
}

export async function listOrdersByUser(userId: string): Promise<OrderDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.orders), where('userId', '==', userId)))
  return snap.docs
    .map((d) => withId<OrderDoc>(d))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(firestore, COLLECTIONS.orders, id), { status, updatedAt: serverTimestamp() })
}

// ===== Consultations =====
export async function createConsultation(data: Omit<ConsultationDoc, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(firestore, COLLECTIONS.consultations), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function listConsultations(): Promise<ConsultationDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.consultations), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => withId<ConsultationDoc>(d))
}

export async function listConsultationsByUser(userId: string): Promise<ConsultationDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.consultations), where('userId', '==', userId)))
  return snap.docs
    .map((d) => withId<ConsultationDoc>(d))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function updateConsultationStatus(id: string, status: string) {
  await updateDoc(doc(firestore, COLLECTIONS.consultations, id), { status, updatedAt: serverTimestamp() })
}

export async function deleteConsultation(id: string) {
  await deleteDoc(doc(firestore, COLLECTIONS.consultations, id))
}

// ===== Reviews =====
export async function createReview(data: Omit<ReviewDoc, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(firestore, COLLECTIONS.reviews), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function listReviewsByProduct(productId: string): Promise<ReviewDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.reviews), where('productId', '==', productId)))
  return snap.docs
    .map((d) => withId<ReviewDoc>(d))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function listReviewsByUser(userId: string): Promise<ReviewDoc[]> {
  const snap = await getDocs(query(collection(firestore, COLLECTIONS.reviews), where('userId', '==', userId)))
  return snap.docs
    .map((d) => withId<ReviewDoc>(d))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function getReviewByOrder(orderId: string, userId: string): Promise<ReviewDoc | null> {
  const snap = await getDocs(
    query(collection(firestore, COLLECTIONS.reviews), where('orderId', '==', orderId), where('userId', '==', userId))
  )
  const first = snap.docs[0]
  return first ? withId<ReviewDoc>(first) : null
}

export async function deleteReview(id: string) {
  await deleteDoc(doc(firestore, COLLECTIONS.reviews, id))
}
