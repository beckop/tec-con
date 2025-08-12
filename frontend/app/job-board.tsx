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
import { router } from 'expo-router'

interface Job {
  id: string
  title: string
  description: string
  category: string
  budget: string
  location: string
  urgency: 'low' | 'medium' | 'high'
  postedAt: string
  applicants: number
  customerName: string
  customerRating: number
}

// Mock jobs data
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Fix leaky kitchen faucet',
    description: 'Kitchen faucet is dripping constantly. Need immediate repair.',
    category: 'Plumbing',
    budget: '$50 - $100',
    location: '2.1 km away',
    urgency: 'high',
    postedAt: '2 hours ago',
    applicants: 3,
    customerName: 'Sarah M.',
    customerRating: 4.8,
  },
  {
    id: '2',
    title: 'Living room deep cleaning',
    description: 'Need professional deep cleaning for a 3-bedroom apartment before move-in.',
    category: 'Cleaning',
    budget: '$100 - $200',
    location: '1.5 km away',
    urgency: 'medium',
    postedAt: '4 hours ago',
    applicants: 7,
    customerName: 'Mike R.',
    customerRating: 4.9,
  },
  {
    id: '3',
    title: 'Install ceiling fan',
    description: 'Need to install a new ceiling fan in the bedroom. Fan already purchased.',
    category: 'Electrical',
    budget: '$50 - $100',
    location: '3.2 km away',
    urgency: 'low',
    postedAt: '1 day ago',
    applicants: 2,
    customerName: 'Lisa K.',
    customerRating: 4.6,
  },
  {
    id: '4',
    title: 'Event photography',
    description: 'Need photographer for a small birthday party (20 people). 3-hour event.',
    category: 'Photography',
    budget: '$200 - $500',
    location: '5.1 km away',
    urgency: 'medium',
    postedAt: '6 hours ago',
    applicants: 12,
    customerName: 'John D.',
    customerRating: 4.7,
  },
]

export default function JobBoard() {
  const [jobs] = useState<Job[]>(MOCK_JOBS)
  const [filter, setFilter] = useState<'all' | 'applied'>('all')

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'warning'
      case 'medium': return 'flash'
      case 'low': return 'time'
      default: return 'information-circle'
    }
  }

  const handleApplyToJob = (job: Job) => {
    Alert.alert(
      'Apply to Job',
      `Do you want to apply for "${job.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: () => {
            Alert.alert('Application Sent', 'Your application has been sent to the customer.')
          }
        },
      ]
    )
  }

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
            <Ionicons 
              name={getUrgencyIcon(item.urgency) as any} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.urgencyText}>{item.urgency}</Text>
          </View>
        </View>
        <Text style={styles.budget}>{item.budget}</Text>
      </View>

      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.jobFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
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
          <Text style={styles.applicants}>{item.applicants} applicants</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => handleApplyToJob(item)}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
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
        <Text style={styles.headerTitle}>Job Board</Text>
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
            All Jobs ({jobs.length})
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

      {/* Jobs List */}
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No jobs available</Text>
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  budget: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
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