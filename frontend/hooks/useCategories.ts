import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface TaskCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export const useCategories = () => {
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Categories fetch error:', error)
        // If table doesn't exist, use hardcoded categories
        if (error.message.includes('relation "public.task_categories" does not exist')) {
          console.log('Task categories table not set up yet, using hardcoded categories')
          setCategories([
            {
              id: '1',
              name: 'Mounting & Installation',
              slug: 'mounting',
              description: 'TV mounting, shelves, art, mirrors',
              icon: 'construct',
              color: '#FF6B35',
              is_active: true,
              sort_order: 1,
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Furniture Assembly',
              slug: 'furniture',
              description: 'IKEA and other furniture assembly',
              icon: 'construct',
              color: '#4ECDC4',
              is_active: true,
              sort_order: 2,
              created_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Moving Help',
              slug: 'moving',
              description: 'Loading, unloading, packing assistance',
              icon: 'car',
              color: '#45B7D1',
              is_active: true,
              sort_order: 3,
              created_at: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Cleaning',
              slug: 'cleaning',
              description: 'Home cleaning, deep cleaning, organizing',
              icon: 'sparkles',
              color: '#96CEB4',
              is_active: true,
              sort_order: 4,
              created_at: new Date().toISOString()
            },
            {
              id: '5',
              name: 'Delivery',
              slug: 'delivery',
              description: 'Pick up and delivery services',
              icon: 'bicycle',
              color: '#FFEAA7',
              is_active: true,
              sort_order: 5,
              created_at: new Date().toISOString()
            },
            {
              id: '6',
              name: 'Handyman',
              slug: 'handyman',
              description: 'General repairs and maintenance',
              icon: 'hammer',
              color: '#DDA0DD',
              is_active: true,
              sort_order: 6,
              created_at: new Date().toISOString()
            }
          ])
          return
        }
        throw error
      }
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      // Don't set error state for database issues, use fallback categories
      if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
        // Use fallback categories if database tables don't exist
        setCategories([
          {
            id: '1',
            name: 'General Tasks',
            slug: 'general',
            description: 'General task assistance',
            icon: 'construct',
            color: '#007AFF',
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString()
          }
        ])
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}