import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutes

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  // undefined = still checking session, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined)
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const reset = () => { lastActivity.current = Date.now() }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))

    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current >= INACTIVITY_MS) {
        supabase.auth.signOut()
      }
    }, 60_000)

    return () => {
      events.forEach(e => window.removeEventListener(e, reset))
      clearInterval(interval)
    }
  }, [user])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
