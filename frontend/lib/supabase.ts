import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Create storage adapter that works on both web and native
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key))
        }
        return Promise.resolve(null)
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
        return Promise.resolve()
      },
    }
  } else {
    // For native platforms, use AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    return AsyncStorage
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
})

// Database types
export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  role: 'customer' | 'technician'
  created_at: string
  updated_at?: string
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface Booking {
  id: string
  customer_id: string
  technician_id?: string
  service_type: string
  description?: string
  scheduled_at?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  location?: {
    address: string
    lat: number
    lng: number
  }
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    username: string
    avatar_url?: string
  }
}