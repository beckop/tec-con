import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

interface Task {
  id: string
  title: string
  description: string
  category: string
  taskSize: 'small' | 'medium' | 'large'
  budget: string
  location: string
  distance: string
  postedAt: string
  applications: number
  customerName: string
  customerRating: number
  urgency: 'flexible' | 'within_week' | 'urgent'
}

// Mock tasks data (TaskRabbit style)
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Mount 65" TV above fireplace',
    description: 'Need help mounting a 65 inch Samsung TV above the fireplace. TV and mount are already purchased. Just need installation.',
    category: 'Mounting & Installation',
    taskSize: 'medium',
    budget: '$75-100',
    location: 'Manhattan, NY',
    distance: '1.2 mi',
    postedAt: '2 hours ago',
    applications: 3,
    customerName: 'Sarah M.',
    customerRating: 4.8,
    urgency: 'within_week',
  },
  {
    id: '2',
    title: 'IKEA dresser assembly',
    description: 'Need help assembling a 6-drawer IKEA HEMNES dresser. All parts and tools will be provided.',
    category: 'Furniture Assembly',
    taskSize: 'small',
    budget: '$40-60',
    location: 'Brooklyn, NY',
    distance: '2.1 mi',
    postedAt: '4 hours ago',
    applications: 7,
    customerName: 'Mike R.',
    customerRating: 4.9,
    urgency: 'flexible',
  },
  {
    id: '3',
    title: 'Help loading moving truck',
    description: 'Need 2 people to help load a 20ft moving truck. 2 bedroom apartment, mostly boxes and some furniture.',
    category: 'Moving Help',
    taskSize: 'large',
    budget: '$150-200',
    location: 'Queens, NY',
    distance: '3.2 mi',
    postedAt: '1 day ago',
    applications: 12,
    customerName: 'Lisa K.',
    customerRating: 4.6,
    urgency: 'urgent',
  },
  {
    id: '4',
    title: 'Deep clean 3 bedroom apartment',
    description: 'Post-construction deep cleaning needed. 3 bedrooms, 2 bathrooms, kitchen, living room. Supplies provided.',
    category: 'Cleaning',
    taskSize: 'large',
    budget: '$200-300',
    location: 'Manhattan, NY',
    distance: '0.8 mi',
    postedAt: '6 hours ago',
    applications: 5,
    customerName: 'John D.',
    customerRating: 4.7,
    urgency: 'within_week',
  },
]

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

export default function BrowseTasks() {
  const { category } = useLocalSearchParams()
  const [tasks] = useState<Task[]>(MOCK_TASKS)
  const [filter, setFilter] = useState<'all' | 'applied'>('all')
  
  const filteredTasks = category 
    ? tasks.filter(task => task.category === category)
    : tasks

  const handleApplyToTask = (task: Task) => {
    Alert.alert(
      'Apply to Task',
      `Do you want to apply for "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: () => {
            Alert.alert('Application Sent', 'Your application has been sent to the customer. They will review and get back to you soon.')
          }
        },
      ]
    )
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => router.push(`/task/${item.id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.sizeBadge, { backgroundColor: getTaskSizeColor(item.taskSize) }]}>
              <Text style={styles.badgeText}>{item.taskSize}</Text>
            </View>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
              <Text style={styles.badgeText}>
                {item.urgency === 'urgent' ? 'Urgent' : 
                 item.urgency === 'within_week' ? '1 Week' : 'Flexible'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.budget}>{item.budget}</Text>
      </View>

      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.distance}>• {item.distance}</Text>
        </View>
        <Text style={styles.postedAt}>{item.postedAt}</Text>
      </View>

      <View style={styles.customerInfo}>
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{item.customerRating}</Text>
          </View>
        </View>
        <View style={styles.applicantsContainer}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.applicants}>{item.applications} applied</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => handleApplyToTask(item)}
      >
        <Text style={styles.applyButtonText}>Apply for Task</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category ? `${category} Tasks` : 'Browse Tasks'}
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
            Available ({filteredTasks.length})
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
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No tasks available</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for new opportunities
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