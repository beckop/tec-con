import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function Home() {
  const { profile, signOut } = useAuth()
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { categories, loading: categoriesLoading } = useCategories()
  const [greeting, setGreeting] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await refetchTasks()
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/auth')
          }
        },
      ]
    )
  }

  const navigateToCategory = (category: any) => {
    if (profile?.role === 'customer') {
      router.push(`/post-task?category=${category.id}`)
    } else {
      router.push(`/browse-tasks?category=${category.id}`)
    }
  }

  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const activeTasks = tasks.filter(task => ['posted', 'assigned', 'in_progress'].includes(task.status)).length
  const totalEarnings = tasks
    .filter(task => task.status === 'completed' && task.final_price)
    .reduce((sum, task) => sum + (task.final_price || 0), 0)

  // Render Customer Dashboard
  if (profile?.role === 'customer') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.userName}>{profile?.full_name}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name="person-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={() => router.push('/post-task')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Post a Task</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#28a745' }]}
              onPress={() => router.push('/my-tasks')}
            >
              <Ionicons name="list" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>My Tasks ({activeTasks})</Text>
            </TouchableOpacity>
          </View>

          {/* Popular Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.slice(0, 6).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => navigateToCategory(category)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={28} color="#fff" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDesc}>{category.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/categories')}
            >
              <Text style={styles.viewAllText}>View All Categories</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Recent Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            {tasksLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading tasks...</Text>
              </View>
            ) : tasks.length > 0 ? (
              <View>
                {tasks.slice(0, 3).map((task) => (
                  <TouchableOpacity 
                    key={task.id} 
                    style={styles.taskCard}
                    onPress={() => router.push(`/task/${task.id}`)}
                  >
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                        <Text style={styles.statusText}>{task.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.taskCategory}>{task.task_categories?.name}</Text>
                    <Text style={styles.taskApplications}>
                      {task.applications_count || 0} applications
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/my-tasks')}
                >
                  <Text style={styles.viewAllText}>View All Tasks</Text>
                  <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No tasks yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Post your first task to get started
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Render Tasker Dashboard
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.userName}>{profile?.full_name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: profile?.available ? '#28a745' : '#dc3545' }]} />
              <Text style={[styles.statusText, { color: profile?.available ? '#28a745' : '#dc3545' }]}>
                {profile?.available ? 'Available for tasks' : 'Not available'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Tasker Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.average_rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => router.push('/browse-tasks')}
          >
            <Ionicons name="search" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Browse Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => router.push('/my-tasks')}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>My Tasks ({activeTasks})</Text>
          </TouchableOpacity>
        </View>

        {/* Available Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Categories</Text>
          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.slice(0, 4).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => navigateToCategory(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={28} color="#fff" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Applications/Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {tasksLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading activity...</Text>
            </View>
          ) : tasks.length > 0 ? (
            <View>
              {tasks.slice(0, 3).map((task) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskCard}
                  onPress={() => router.push(`/task/${task.id}`)}
                >
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                      <Text style={styles.statusText}>{task.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.taskCategory}>{task.task_categories?.name}</Text>
                  <Text style={styles.taskBudget}>
                    ${task.budget_min}-${task.budget_max}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No activity yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start browsing tasks to build your reputation
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 4,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  taskCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  taskApplications: {
    fontSize: 14,
    color: '#666',
  },
  taskBudget: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
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