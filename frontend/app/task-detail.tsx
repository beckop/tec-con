import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { useTasks, useTaskApplications } from '../hooks/useTasks'
import { useChat } from '../hooks/useChat'

interface TaskDetail {
  id: string
  title: string
  description: string
  status: string
  budget_min: number
  budget_max: number
  final_price?: number
  task_size: string
  urgency: string
  address: string
  city: string
  state: string
  created_at: string
  task_categories: {
    name: string
    icon: string
    color: string
  }
  customer_profile: {
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
  applications: any[]
  applications_count: number
}

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile } = useAuth()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const { updateTaskStatus, assignTasker } = useTasks()
  const { applyToTask } = useTaskApplications()

  const partnerId = task?.customer_id === profile?.id 
    ? task?.tasker_id 
    : task?.customer_id

  const { messages, sendMessage, loading: chatLoading } = useChat(
    id || '', 
    partnerId || ''
  )

  useEffect(() => {
    if (id) {
      fetchTaskDetail()
    }
  }, [id])

  const fetchTaskDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer demo-token`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTask(data)
      } else {
        Alert.alert('Error', 'Failed to load task details')
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      Alert.alert('Error', 'Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    Alert.prompt(
      'Apply to Task',
      'Tell the customer why you\'re the right person for this job:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: async (message) => {
            if (message && message.trim()) {
              try {
                await applyToTask(id!, {
                  message: message.trim(),
                  proposed_price: task?.budget_max,
                })
                Alert.alert('Success', 'Your application has been sent!')
                fetchTaskDetail() // Refresh task data
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to apply')
              }
            }
          }
        },
      ],
      'plain-text'
    )
  }

  const handleAcceptApplication = (applicationId: string, taskerId: string) => {
    Alert.alert(
      'Accept Application',
      'Are you sure you want to accept this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await assignTasker(id!, taskerId)
              Alert.alert('Success', 'Application accepted and task assigned!')
              fetchTaskDetail() // Refresh task data
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to accept application')
            }
          }
        },
      ]
    )
  }

  const handleUpdateStatus = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Change task status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateTaskStatus(id!, newStatus as any)
              Alert.alert('Success', 'Task status updated!')
              fetchTaskDetail() // Refresh task data
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update status')
            }
          }
        },
      ]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return '#007AFF'
      case 'assigned': return '#ffc107'
      case 'in_progress': return '#17a2b8'
      case 'completed': return '#28a745'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const canChat = task && task.tasker_id && (
    profile?.id === task.customer_id || profile?.id === task.tasker_id
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc3545" />
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (showChat && canChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageCard,
                  message.sender_id === profile?.id
                    ? styles.myMessage
                    : styles.theirMessage
                ]}
              >
                <Text style={styles.messageText}>{message.content}</Text>
                <Text style={styles.messageTime}>
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.messageInputContainer}>
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => {
                Alert.prompt(
                  'Send Message',
                  'Type your message:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Send',
                      onPress: (text) => {
                        if (text && text.trim()) {
                          sendMessage(text.trim())
                        }
                      }
                    }
                  ],
                  'plain-text'
                )
              }}
            >
              <Ionicons name="send" size={24} color="#fff" />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        {canChat && (
          <TouchableOpacity onPress={() => setShowChat(true)}>
            <Ionicons name="chatbubble" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        {!canChat && <View style={{ width: 24 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status.toUpperCase()}</Text>
        </View>

        {/* Task Header */}
        <View style={styles.taskHeader}>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryIcon, { backgroundColor: task.task_categories.color }]}>
              <Ionicons name={task.task_categories.icon as any} size={20} color="#fff" />
            </View>
            <Text style={styles.categoryName}>{task.task_categories.name}</Text>
          </View>
          
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.budget}>
            ${task.budget_min}-${task.budget_max}
            {task.final_price && ` • Final: $${task.final_price}`}
          </Text>
        </View>

        {/* Task Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.location}>{task.address}, {task.city}, {task.state}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Size</Text>
              <Text style={styles.infoValue}>{task.task_size}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Urgency</Text>
              <Text style={styles.infoValue}>{task.urgency}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Applications</Text>
              <Text style={styles.infoValue}>{task.applications_count}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Posted</Text>
              <Text style={styles.infoValue}>
                {new Date(task.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{task.customer_profile.full_name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>
                  {task.customer_profile.average_rating.toFixed(1)}
                </Text>
                <Text style={styles.reviews}>
                  ({task.customer_profile.total_reviews} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tasker Info (if assigned) */}
        {task.tasker_profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Tasker</Text>
            <View style={styles.profileCard}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{task.tasker_profile.full_name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>
                    {task.tasker_profile.average_rating.toFixed(1)}
                  </Text>
                  <Text style={styles.reviews}>
                    ({task.tasker_profile.total_reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Applications (for customers) */}
        {profile?.id === task.customer_id && task.applications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Applications ({task.applications.length})
            </Text>
            {task.applications.map((app) => (
              <View key={app.id} style={styles.applicationCard}>
                <View style={styles.applicantHeader}>
                  <Text style={styles.applicantName}>
                    {app.tasker_profile.full_name}
                  </Text>
                  <Text style={styles.applicationPrice}>${app.proposed_price}</Text>
                </View>
                
                {app.message && (
                  <Text style={styles.applicationMessage}>{app.message}</Text>
                )}
                
                <View style={styles.applicantInfo}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>
                      {app.tasker_profile.average_rating.toFixed(1)}
                    </Text>
                    <Text style={styles.reviews}>
                      ({app.tasker_profile.total_reviews})
                    </Text>
                  </View>
                  
                  {app.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptApplication(app.id, app.tasker_id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  )}
                  
                  {app.status === 'accepted' && (
                    <View style={styles.acceptedBadge}>
                      <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {profile?.role === 'tasker' && 
           task.status === 'posted' && 
           task.customer_id !== profile.id && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleApply}
            >
              <Text style={styles.primaryButtonText}>Apply for Task</Text>
            </TouchableOpacity>
          )}

          {profile?.id === task.tasker_id && task.status === 'assigned' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleUpdateStatus('in_progress')}
            >
              <Text style={styles.primaryButtonText}>Start Task</Text>
            </TouchableOpacity>
          )}

          {profile?.id === task.tasker_id && task.status === 'in_progress' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleUpdateStatus('completed')}
            >
              <Text style={styles.primaryButtonText}>Complete Task</Text>
            </TouchableOpacity>
          )}

          {(profile?.id === task.customer_id || profile?.id === task.tasker_id) &&
           task.status !== 'completed' && task.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleUpdateStatus('cancelled')}
            >
              <Text style={styles.cancelButtonText}>Cancel Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#dc3545',
  },
  scrollView: {
    flex: 1,
  },
  statusBanner: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  budget: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  reviews: {
    fontSize: 14,
    color: '#999',
  },
  applicationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  applicationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#28a745',
  },
  applicationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  applicantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  messageInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})