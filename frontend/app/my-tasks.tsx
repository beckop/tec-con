import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'

export default function MyTasks() {
  const { profile } = useAuth()
  const { tasks, loading, refetch, updateTaskStatus } = useTasks()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return ['posted', 'assigned', 'in_progress'].includes(task.status)
      case 'completed':
        return task.status === 'completed'
      default:
        return true
    }
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleStatusUpdate = (task: any) => {
    const isCustomer = profile?.role === 'customer'
    const isTasker = profile?.role === 'tasker'
    
    let options: any[] = []
    
    if (isCustomer) {
      if (task.status === 'posted') {
        options = [
          { text: 'Cancel Task', style: 'destructive', action: 'cancelled' },
        ]
      } else if (task.status === 'assigned') {
        options = [
          { text: 'Mark Complete', action: 'completed' },
        ]
      }
    } else if (isTasker && task.tasker_id === profile?.id) {
      if (task.status === 'assigned') {
        options = [
          { text: 'Start Task', action: 'in_progress' },
        ]
      } else if (task.status === 'in_progress') {
        options = [
          { text: 'Mark Complete', action: 'completed' },
        ]
      }
    }

    if (options.length === 0) return

    Alert.alert(
      'Update Task Status',
      `Current status: ${task.status}`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...options.map(option => ({
          text: option.text,
          style: option.style,
          onPress: () => updateTaskStatus(task.id, option.action)
        }))
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderTask = ({ item: task }: { item: any }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => router.push(`/task/${task.id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
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

      <View style={styles.taskDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{task.city}, {task.state}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {task.task_date ? formatDate(task.task_date) : 'Flexible'}
          </Text>
        </View>
      </View>

      {profile?.role === 'customer' && (
        <View style={styles.taskFooter}>
          <Text style={styles.applicationsText}>
            {task.applications_count || 0} applications
          </Text>
          {task.tasker_id && task.tasker_profile && (
            <View style={styles.taskerInfo}>
              <Text style={styles.taskerLabel}>Tasker: </Text>
              <Text style={styles.taskerName}>
                {task.tasker_profile.full_name}
              </Text>
            </View>
          )}
        </View>
      )}

      {profile?.role === 'tasker' && task.customer_profile && (
        <View style={styles.taskFooter}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerLabel}>Customer: </Text>
            <Text style={styles.customerName}>
              {task.customer_profile.full_name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>
                {task.customer_profile.average_rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push(`/task/${task.id}`)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {(['posted', 'assigned', 'in_progress'].includes(task.status)) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleStatusUpdate(task)}
          >
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/post-task')}>
          <Ionicons name="add" size={24} color="#007AFF" />
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
            All ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Active ({tasks.filter(t => ['posted', 'assigned', 'in_progress'].includes(t.status)).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Complete ({tasks.filter(t => t.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
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
              {loading ? 'Loading tasks...' : 'No tasks found'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {loading ? 'Please wait' : 
               profile?.role === 'customer' 
                 ? 'Post your first task to get started'
                 : 'Browse available tasks to find work'
              }
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
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
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
  taskDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  taskFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  applicationsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskerLabel: {
    fontSize: 14,
    color: '#666',
  },
  taskerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerLabel: {
    fontSize: 14,
    color: '#666',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
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
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  actionButtonText: {
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
    paddingHorizontal: 40,
  },
})