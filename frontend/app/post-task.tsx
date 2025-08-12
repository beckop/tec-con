import React, { useState, useEffect } from 'react'
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
import { useTasks } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'

const TASK_SIZES = [
  { 
    id: 'small', 
    label: 'Small', 
    description: '1 hour or less', 
    budgetMin: 25, 
    budgetMax: 75,
    example: 'Quick fix, simple assembly'
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    description: '2-4 hours', 
    budgetMin: 50, 
    budgetMax: 200,
    example: 'TV mounting, furniture assembly'
  },
  { 
    id: 'large', 
    label: 'Large', 
    description: '4+ hours or multi-day', 
    budgetMin: 150, 
    budgetMax: 500,
    example: 'Moving help, deep cleaning'
  },
]

export default function PostTask() {
  const { category } = useLocalSearchParams()
  const { profile } = useAuth()
  const { createTask } = useTasks()
  const { categories, loading: categoriesLoading } = useCategories()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [taskSize, setTaskSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [budgetMin, setBudgetMin] = useState<number>(50)
  const [budgetMax, setBudgetMax] = useState<number>(150)
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [urgency, setUrgency] = useState<'flexible' | 'within_week' | 'urgent'>('flexible')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [loading, setLoading] = useState(false)

  // Set initial category if provided
  useEffect(() => {
    if (category && categories.length > 0) {
      const foundCategory = categories.find(cat => cat.id === category)
      if (foundCategory) {
        setSelectedCategoryId(foundCategory.id)
      }
    }
  }, [category, categories])

  // Update budget when task size changes
  useEffect(() => {
    const size = TASK_SIZES.find(s => s.id === taskSize)
    if (size) {
      setBudgetMin(size.budgetMin)
      setBudgetMax(size.budgetMax)
    }
  }, [taskSize])

  const handlePostTask = async () => {
    if (!title || !description || !selectedCategoryId || !address || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields')
      return
    }

    if (budgetMin >= budgetMax) {
      Alert.alert('Invalid Budget', 'Maximum budget must be higher than minimum budget')
      return
    }

    setLoading(true)
    try {
      await createTask({
        title,
        description,
        category_id: selectedCategoryId,
        address,
        city,
        state,
        zip_code: zipCode,
        task_size: taskSize,
        budget_min: budgetMin,
        budget_max: budgetMax,
        task_date: taskDate || undefined,
        task_time: taskTime || undefined,
        urgency,
        special_instructions: specialInstructions || undefined,
      })
      
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
              // Reset form
              setTitle('')
              setDescription('')
              setSelectedCategoryId('')
              setTaskSize('medium')
              setAddress('')
              setCity('')
              setState('')
              setZipCode('')
              setTaskDate('')
              setTaskTime('')
              setUrgency('flexible')
              setSpecialInstructions('')
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Error posting task:', error)
      Alert.alert('Error', 'Failed to post task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

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
            {categoriesLoading ? (
              <Text style={styles.loadingText}>Loading categories...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        selectedCategoryId === cat.id && styles.categoryChipSelected,
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <View style={[styles.categoryIconSmall, { backgroundColor: cat.color }]}>
                        <Ionicons name={cat.icon as any} size={16} color="#fff" />
                      </View>
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategoryId === cat.id && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
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
                  onPress={() => setTaskSize(size.id as any)}
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
                      styles.taskSizeExample,
                      taskSize === size.id && styles.taskSizeExampleSelected,
                    ]}
                  >
                    {size.example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Range *</Text>
            <View style={styles.budgetContainer}>
              <View style={styles.budgetField}>
                <Text style={styles.budgetLabel}>Min $</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetMin.toString()}
                  onChangeText={(text) => setBudgetMin(parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <Text style={styles.budgetSeparator}>to</Text>
              <View style={styles.budgetField}>
                <Text style={styles.budgetLabel}>Max $</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetMax.toString()}
                  onChangeText={(text) => setBudgetMax(parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 8 }]}
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="State"
                value={state}
                onChangeText={setState}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Zip"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.label}>When do you need this done?</Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeField}>
                <Text style={styles.dateTimeLabel}>Date (Optional)</Text>
                <TouchableOpacity style={styles.dateTimeInput}>
                  <Text style={styles.dateTimeText}>
                    {taskDate || 'Flexible'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimeField}>
                <Text style={styles.dateTimeLabel}>Time (Optional)</Text>
                <TouchableOpacity style={styles.dateTimeInput}>
                  <Text style={styles.dateTimeText}>
                    {taskTime || 'Flexible'}
                  </Text>
                  <Ionicons name="time" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Urgency */}
          <View style={styles.section}>
            <Text style={styles.label}>How urgent is this?</Text>
            <View style={styles.urgencyContainer}>
              {[
                { id: 'flexible', label: 'Flexible', icon: 'time', color: '#28a745' },
                { id: 'within_week', label: 'Within a week', icon: 'flash', color: '#ffc107' },
                { id: 'urgent', label: 'Urgent', icon: 'warning', color: '#dc3545' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.urgencyButton,
                    urgency === option.id && { backgroundColor: option.color },
                  ]}
                  onPress={() => setUrgency(option.id as any)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={urgency === option.id ? '#fff' : option.color} 
                  />
                  <Text
                    style={[
                      styles.urgencyText,
                      urgency === option.id && { color: '#fff' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.label}>Special Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific requirements, access instructions, or important details..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
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
              By posting, you agree to TaskHub's Terms of Service
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
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  taskSizeExample: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  taskSizeExampleSelected: {
    color: '#007AFF',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetField: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  budgetInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  budgetSeparator: {
    fontSize: 16,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: 8,
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
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
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
    gap: 6,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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