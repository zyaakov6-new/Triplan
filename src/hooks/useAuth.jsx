import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id, authUser) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!data) {
      // First-time OAuth sign-in — create profile from provider metadata
      const name =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        authUser?.email?.split('@')[0] ||
        'Traveler'
      const { data: created } = await supabase
        .from('profiles').upsert({ id, name }).select().single()
      setProfile(created)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    return error
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return error
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithGoogle, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
