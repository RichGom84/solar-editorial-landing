'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { getUserDoc, upsertUserDoc, type Role, type UserDoc } from '@/lib/firestore-db'

interface AuthContextValue {
  user: User | null
  profile: UserDoc | null
  role: Role | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u: User) => {
    let p = await getUserDoc(u.uid)
    if (!p) {
      await upsertUserDoc(u.uid, {
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        image: u.photoURL,
      })
      p = await getUserDoc(u.uid)
    }
    setProfile(p)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u)
      if (u) {
        try {
          await loadProfile(u)
        } catch (e) {
          console.error('[AuthProvider] profile load error:', e)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const refreshProfile = async () => {
    if (user) await loadProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role ?? null, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
