import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface ChatMessage {
  id: string
  task_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'system'
  attachments?: string[]
  read_at?: string
  created_at: string
  
  // Joined data
  sender_profile?: {
    full_name: string
    username: string
    avatar_url?: string
  }
}

export const useChat = (taskId: string, partnerId: string) => {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey (full_name, username, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text') => {
    try {
      if (!profile || !content.trim()) return

      const { data, error } = await supabase
        .from('messages')
        .insert({
          task_id: taskId,
          sender_id: profile.id,
          receiver_id: partnerId,
          content: content.trim(),
          message_type: messageType,
        })
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey (full_name, username, avatar_url)
        `)
        .single()

      if (error) throw error

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, data])
      
      return data
    } catch (err: any) {
      console.error('Error sending message:', err)
      throw err
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', profile?.id)

      if (error) throw error
    } catch (err: any) {
      console.error('Error marking message as read:', err)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!taskId || !profile) return

    const subscription = supabase
      .channel(`task_messages:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${taskId}`,
        },
        async (payload) => {
          console.log('New message received:', payload.new)
          
          // Fetch the complete message with profile data
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender_profile:profiles!messages_sender_id_fkey (full_name, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(msg => msg.id === data.id)) {
                return prev
              }
              return [...prev, data]
            })

            // Mark as read if it's for me
            if (data.receiver_id === profile.id) {
              markAsRead(data.id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [taskId, profile])

  useEffect(() => {
    if (taskId && partnerId) {
      fetchMessages()
    }
  }, [taskId, partnerId])

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  }
}