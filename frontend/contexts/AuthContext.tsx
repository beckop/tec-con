import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  full_name: string
  username: string
  role: 'customer' | 'tasker'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error.message)
        
        // Check if the error is due to missing table or missing profile
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created by trigger')
          // Profile doesn't exist yet, but should be created by trigger
          // Wait a moment and try again, but limit retries
          const retryCount = (fetchProfile as any).retryCount || 0
          if (retryCount < 3) {
            (fetchProfile as any).retryCount = retryCount + 1
            setTimeout(() => fetchProfile(userId), 2000)
            return
          } else {
            console.log('Max retries reached, continuing without profile')
            // Create a temporary profile for demo purposes
            setProfile({
              id: userId,
              email: session?.user?.email || '',
              full_name: 'Demo User',
              username: 'demouser',
              role: 'customer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as UserProfile)
          }
        } else if (error.message.includes('relation "public.profiles" does not exist')) {
          console.log('Profiles table does not exist, using demo profile')
          // Database tables don't exist yet, create a demo profile
          setProfile({
            id: userId,
            email: session?.user?.email || '',
            full_name: 'Demo User',
            username: 'demouser',
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile)
        } else {
          throw error
        }
      } else if (data) {
        console.log('Profile loaded:', data.role, data.full_name)
        setProfile(data)
        // Reset retry counter on success
        delete (fetchProfile as any).retryCount
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Create demo profile on any error to prevent infinite loading
      setProfile({
        id: userId,
        email: session?.user?.email || '',
        full_name: 'Demo User',
        username: 'demouser',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username,
            role: userData.role,
          },
        },
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}