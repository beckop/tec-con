import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const SERVICE_CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: 'water', color: '#3498db' },
  { id: '2', name: 'Electrical', icon: 'flash', color: '#f39c12' },
  { id: '3', name: 'Cleaning', icon: 'sparkles', color: '#2ecc71' },
  { id: '4', name: 'Photography', icon: 'camera', color: '#9b59b6' },
  { id: '5', name: 'IT Support', icon: 'laptop', color: '#34495e' },
  { id: '6', name: 'Carpentry', icon: 'hammer', color: '#8b4513' },
  { id: '7', name: 'Gardening', icon: 'leaf', color: '#27ae60' },
  { id: '8', name: 'Moving', icon: 'car', color: '#e74c3c' },
]

export default function Home() {
  const { profile, signOut } = useAuth()

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

  const navigateToSearch = (category: string) => {
    router.push(`/search?category=${category}`)
  }

  const navigateToPostJob = () => {
    router.push('/post-job')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name}!</Text>
            <Text style={styles.subGreeting}>
              {profile?.role === 'customer' 
                ? 'What service do you need today?' 
                : 'Ready to help customers today?'
              }
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        {profile?.role === 'customer' && (
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Find Technicians</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={navigateToPostJob}
            >
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                Post a Job
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {profile?.role === 'technician' && (
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => router.push('/job-board')}
            >
              <Ionicons name="briefcase" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Browse Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => router.push('/my-bookings')}
            >
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                My Bookings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {profile?.role === 'customer' ? 'Browse Services' : 'Service Categories'}
          </Text>
          <View style={styles.categoriesGrid}>
            {SERVICE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                onPress={() => navigateToSearch(category.name)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <Ionicons name="time" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              {profile?.role === 'customer' 
                ? 'Book your first service to get started'
                : 'Accept jobs to see your activity here'
              }
            </Text>
          </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  primaryAction: {
    backgroundColor: '#007AFF',
  },
  secondaryAction: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActionText: {
    color: '#007AFF',
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
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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