import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Task {
  id: string
  customer_id: string
  tasker_id?: string
  category_id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  task_date?: string
  task_time?: string
  flexible_date: boolean
  estimated_hours?: number
  budget_min?: number
  budget_max?: number
  final_price?: number
  task_size: 'small' | 'medium' | 'large'
  status: 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  urgency: 'flexible' | 'within_week' | 'urgent'
  special_instructions?: string
  photos?: string[]
  created_at: string
  updated_at: string
  completed_at?: string
  
  // Joined data
  task_categories?: {
    name: string
    slug: string
    icon: string
    color: string
  }
  customer_profile?: {
    full_name: string
    username: string
    avatar_url?: string
    average_rating: number
    total_reviews: number
  }
  tasker_profile?: {
    full_name: string
    username: string
    avatar_url?: string
    average_rating: number
    total_reviews: number
  }
  applications_count?: number
}

export interface TaskApplication {
  id: string
  task_id: string
  tasker_id: string
  message?: string
  proposed_price?: number
  estimated_time?: number
  availability_date?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  
  // Joined data
  tasker_profile?: {
    full_name: string
    username: string
    avatar_url?: string
    average_rating: number
    total_reviews: number
    hourly_rate?: number
    bio?: string
    skills?: string[]
  }
}

export const useTasks = () => {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_categories (name, slug, icon, color),
          customer_profile:profiles!customer_id (full_name, username, avatar_url, average_rating, total_reviews),
          tasker_profile:profiles!tasker_id (full_name, username, avatar_url, average_rating, total_reviews)
        `)

      // Filter based on user role
      if (profile?.role === 'customer') {
        query = query.eq('customer_id', profile.id)
      } else if (profile?.role === 'tasker') {
        // Taskers see either unassigned tasks or tasks they're assigned to
        query = query.or(`tasker_id.is.null,tasker_id.eq.${profile.id}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Get application counts for each task
      if (data && data.length > 0) {
        const taskIds = data.map(task => task.id)
        const { data: applicationCounts } = await supabase
          .from('task_applications')
          .select('task_id')
          .in('task_id', taskIds)

        // Count applications per task
        const countsMap = applicationCounts?.reduce((acc, app) => {
          acc[app.task_id] = (acc[app.task_id] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        // Add counts to tasks
        const tasksWithCounts = data.map(task => ({
          ...task,
          applications_count: countsMap[task.id] || 0
        }))

        setTasks(tasksWithCounts)
      } else {
        setTasks([])
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: {
    title: string
    description: string
    category_id: string
    address: string
    city: string
    state: string
    zip_code: string
    task_size: 'small' | 'medium' | 'large'
    budget_min?: number
    budget_max?: number
    task_date?: string
    task_time?: string
    urgency: 'flexible' | 'within_week' | 'urgent'
    special_instructions?: string
  }) => {
    try {
      if (!profile) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          customer_id: profile.id,
          flexible_date: !taskData.task_date,
        })
        .select()
        .single()

      if (error) throw error

      await fetchTasks() // Refresh tasks list
      return data
    } catch (err: any) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', taskId)

      if (error) throw error

      await fetchTasks() // Refresh tasks list
    } catch (err: any) {
      console.error('Error updating task status:', err)
      throw err
    }
  }

  const assignTasker = async (taskId: string, taskerId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          tasker_id: taskerId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      await fetchTasks() // Refresh tasks list
    } catch (err: any) {
      console.error('Error assigning tasker:', err)
      throw err
    }
  }

  useEffect(() => {
    if (profile) {
      fetchTasks()
    }
  }, [profile])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTaskStatus,
    assignTasker,
  }
}

export const useTaskApplications = (taskId?: string) => {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<TaskApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('task_applications')
        .select(`
          *,
          tasker_profile:profiles!tasker_id (
            full_name, username, avatar_url, average_rating, total_reviews, 
            hourly_rate, bio, skills
          )
        `)

      if (taskId) {
        query = query.eq('task_id', taskId)
      } else if (profile?.role === 'tasker') {
        query = query.eq('tasker_id', profile.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err: any) {
      console.error('Error fetching applications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyToTask = async (taskId: string, applicationData: {
    message?: string
    proposed_price?: number
    estimated_time?: number
    availability_date?: string
  }) => {
    try {
      if (!profile) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('task_applications')
        .insert({
          task_id: taskId,
          tasker_id: profile.id,
          ...applicationData,
        })
        .select()
        .single()

      if (error) throw error

      await fetchApplications() // Refresh applications list
      return data
    } catch (err: any) {
      console.error('Error applying to task:', err)
      throw err
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: TaskApplication['status']) => {
    try {
      const { error } = await supabase
        .from('task_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      await fetchApplications() // Refresh applications list
    } catch (err: any) {
      console.error('Error updating application status:', err)
      throw err
    }
  }

  useEffect(() => {
    if (profile && (taskId || profile.role === 'tasker')) {
      fetchApplications()
    }
  }, [profile, taskId])

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    applyToTask,
    updateApplicationStatus,
  }
}