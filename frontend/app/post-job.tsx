import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'

const SERVICE_CATEGORIES = [
  'Plumbing', 'Electrical', 'Cleaning', 'Photography', 
  'IT Support', 'Carpentry', 'Gardening', 'Moving'
]

const BUDGET_RANGES = [
  { label: 'Under $50', value: 'under_50' },
  { label: '$50 - $100', value: '50_100' },
  { label: '$100 - $200', value: '100_200' },
  { label: '$200 - $500', value: '200_500' },
  { label: 'Over $500', value: 'over_500' },
]

export default function PostJob() {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)

  const handlePostJob = async () => {
    if (!title || !description || !category) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Here you would normally post to your API
      // For now, we'll simulate posting a job
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      Alert.alert(
        'Job Posted Successfully!',
        'Technicians in your area will be notified about your job posting.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Job Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fix leaky kitchen faucet"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Service Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {SERVICE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the work that needs to be done..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Range</Text>
            <View style={styles.budgetContainer}>
              {BUDGET_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.budgetChip,
                    budget === range.value && styles.budgetChipSelected,
                  ]}
                  onPress={() => setBudget(range.value)}
                >
                  <Text
                    style={[
                      styles.budgetChipText,
                      budget === range.value && styles.budgetChipTextSelected,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address or area"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Urgency */}
          <View style={styles.section}>
            <Text style={styles.label}>Urgency Level</Text>
            <View style={styles.urgencyContainer}>
              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'low' && styles.urgencyButtonSelected,
                ]}
                onPress={() => setUrgency('low')}
              >
                <Ionicons 
                  name="time" 
                  size={20} 
                  color={urgency === 'low' ? '#fff' : '#28a745'} 
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'low' && styles.urgencyTextSelected,
                  ]}
                >
                  Low
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'medium' && styles.urgencyButtonSelected,
                ]}
                onPress={() => setUrgency('medium')}
              >
                <Ionicons 
                  name="flash" 
                  size={20} 
                  color={urgency === 'medium' ? '#fff' : '#ffc107'} 
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'medium' && styles.urgencyTextSelected,
                  ]}
                >
                  Medium
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'high' && styles.urgencyButtonSelected,
                ]}
                onPress={() => setUrgency('high')}
              >
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color={urgency === 'high' ? '#fff' : '#dc3545'} 
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'high' && styles.urgencyTextSelected,
                  ]}
                >
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePostJob}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  budgetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  budgetChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  budgetChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  budgetChipText: {
    fontSize: 14,
    color: '#666',
  },
  budgetChipTextSelected: {
    color: '#fff',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  urgencyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  urgencyTextSelected: {
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})