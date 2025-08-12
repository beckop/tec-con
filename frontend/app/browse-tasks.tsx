import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { useTasks, useTaskApplications } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'

export default function BrowseTasks() {
  const { category } = useLocalSearchParams()
  const { profile } = useAuth()
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { applyToTask } = useTaskApplications()
  const { categories } = useCategories()
  const [filter, setFilter] = useState<'all' | 'applied'>('all')
  const [refreshing, setRefreshing] = useState(false)
  
  // Filter tasks for taskers
  const availableTasks = tasks.filter(task => {
    // Only show unassigned tasks or tasks I'm assigned to
    const isAvailable = task.status === 'posted' || task.tasker_id === profile?.id
    
    // Filter by category if specified
    if (category && task.category_id !== category) {
      return false
    }
    
    return isAvailable
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await refetchTasks()
    setRefreshing(false)
  }

  const handleApplyToTask = (task: any) => {
    Alert.alert(
      'Apply to Task',
      `Do you want to apply for "${task.title}"?\n\nBudget: $${task.budget_min}-${task.budget_max}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: () => showApplicationForm(task)
        },
      ]
    )
  }

  const showApplicationForm = (task: any) => {
    Alert.prompt(
      'Application Message',
      'Tell the customer why you\'re the right person for this job:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: async (message) => {
            if (message && message.trim()) {
              try {
                await applyToTask(task.id, {
                  message: message.trim(),
                  proposed_price: task.budget_max, // Default to max budget
                })
                Alert.alert('Success', 'Your application has been sent!')
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to apply to task')
              }
            }
          }
        },
      ],
      'plain-text',
      '',
      'default'
    )
  }

  const getTaskSizeColor = (size: string) => {
    switch (size) {
      case 'small': return '#28a745'
      case 'medium': return '#ffc107'
      case 'large': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '#dc3545'
      case 'within_week': return '#ffc107'
      case 'flexible': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgent'
      case 'within_week': return '1 Week'
      case 'flexible': return 'Flexible'
      default: return urgency
    }
  }

  const calculateDistance = (task: any) => {
    // Mock distance calculation
    return `${(Math.random() * 5 + 0.5).toFixed(1)} mi`
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const taskDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const renderTask = ({ item: task }: { item: any }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => router.push(`/task/${task.id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.sizeBadge, { backgroundColor: getTaskSizeColor(task.task_size) }]}>
              <Text style={styles.badgeText}>{task.task_size}</Text>
            </View>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(task.urgency) }]}>
              <Text style={styles.badgeText}>{getUrgencyLabel(task.urgency)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.budget}>
          ${task.budget_min}-${task.budget_max}
        </Text>
      </View>

      <Text style={styles.category}>{task.task_categories?.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.location}>{task.city}, {task.state}</Text>
          <Text style={styles.distance}>• {calculateDistance(task)}</Text>
        </View>
        <Text style={styles.postedAt}>{formatTimeAgo(task.created_at)}</Text>
      </View>

      <View style={styles.customerInfo}>
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{task.customer_profile?.full_name || 'Customer'}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {task.customer_profile?.average_rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.reviews}>
              ({task.customer_profile?.total_reviews || 0})
            </Text>
          </View>
        </View>
        <View style={styles.applicantsContainer}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.applicants}>{task.applications_count || 0} applied</Text>
        </View>
      </View>

      {task.tasker_id === profile?.id ? (
        <View style={styles.assignedButton}>
          <Text style={styles.assignedButtonText}>Assigned to You</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => handleApplyToTask(task)}
        >
          <Text style={styles.applyButtonText}>Apply for Task</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )

  const selectedCategory = categories.find(cat => cat.id === category)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? `${selectedCategory.name} Tasks` : 'Browse Tasks'}
        </Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            Available ({availableTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'applied' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('applied')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'applied' && styles.filterTabTextActive,
            ]}
          >
            Applied (0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={availableTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {tasksLoading ? 'Loading tasks...' : 'No tasks available'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {tasksLoading ? 'Please wait' : 'Check back later for new opportunities'}
            </Text>
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  budget: {
    fontSize: 16,
    fontWeight: '700',
    color: '#28a745',
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  distance: {
    fontSize: 14,
    color: '#999',
  },
  postedAt: {
    fontSize: 12,
    color: '#999',
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  reviews: {
    fontSize: 12,
    color: '#999',
  },
  applicantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicants: {
    fontSize: 12,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  assignedButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
})