import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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