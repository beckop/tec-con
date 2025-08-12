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
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'

// TaskRabbit-style categories
const CATEGORIES = [
  'Mounting & Installation', 'Furniture Assembly', 'Moving Help', 'Cleaning',
  'Delivery', 'Handyman', 'Electrical', 'Plumbing', 'Painting', 'Yard Work'
]

const TASK_SIZES = [
  { id: 'small', label: 'Small', description: '1 hour or less', price: '$25-50' },
  { id: 'medium', label: 'Medium', description: '2-4 hours', price: '$50-150' },
  { id: 'large', label: 'Large', description: '4+ hours or multi-day', price: '$150+' },
]

export default function PostTask() {
  const { category } = useLocalSearchParams()
  const { profile } = useAuth()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category || '')
  const [taskSize, setTaskSize] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePostTask = async () => {
    if (!title || !description || !selectedCategory || !taskSize) {
      Alert.alert('Missing Information', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      Alert.alert(
        'Task Posted Successfully!',
        'Taskers in your area will be notified and can apply to help you.',
        [
          {
            text: 'View My Tasks',
            onPress: () => router.push('/my-tasks')
          },
          {
            text: 'Post Another',
            onPress: () => {
              setTitle('')
              setDescription('')
              setSelectedCategory('')
              setTaskSize('')
              setTaskDate('')
              setTaskTime('')
              setAddress('')
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to post task. Please try again.')
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
        <Text style={styles.headerTitle}>Post a Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Task Title */}
          <View style={styles.section}>
            <Text style={styles.label}>What do you need done? *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mount 55 inch TV above fireplace"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Task Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Task Details *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your task in detail. Include any specifics, materials needed, or special instructions..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {description.length}/1000
            </Text>
          </View>

          {/* Task Size */}
          <View style={styles.section}>
            <Text style={styles.label}>Task Size *</Text>
            <Text style={styles.helper}>Help Taskers understand the scope</Text>
            <View style={styles.taskSizeContainer}>
              {TASK_SIZES.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.taskSizeCard,
                    taskSize === size.id && styles.taskSizeCardSelected,
                  ]}
                  onPress={() => setTaskSize(size.id)}
                >
                  <Text
                    style={[
                      styles.taskSizeLabel,
                      taskSize === size.id && styles.taskSizeLabelSelected,
                    ]}
                  >
                    {size.label}
                  </Text>
                  <Text
                    style={[
                      styles.taskSizeDesc,
                      taskSize === size.id && styles.taskSizeDescSelected,
                    ]}
                  >
                    {size.description}
                  </Text>
                  <Text
                    style={[
                      styles.taskSizePrice,
                      taskSize === size.id && styles.taskSizePriceSelected,
                    ]}
                  >
                    {size.price}
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
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.label}>When do you need this done?</Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeField}>
                <Text style={styles.dateTimeLabel}>Date</Text>
                <TouchableOpacity style={styles.dateTimeInput}>
                  <Text style={styles.dateTimeText}>
                    {taskDate || 'Select date'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimeField}>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <TouchableOpacity style={styles.dateTimeInput}>
                  <Text style={styles.dateTimeText}>
                    {taskTime || 'Select time'}
                  </Text>
                  <Ionicons name="time" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePostTask}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting Task...' : 'Post Task'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By posting, you agree to TaskRabbit's Terms of Service
            </Text>
          </View>
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
  helper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
  taskSizeContainer: {
    gap: 12,
  },
  taskSizeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  taskSizeCardSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  taskSizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskSizeLabelSelected: {
    color: '#007AFF',
  },
  taskSizeDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskSizeDescSelected: {
    color: '#666',
  },
  taskSizePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  taskSizePriceSelected: {
    color: '#007AFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  dateTimeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
})