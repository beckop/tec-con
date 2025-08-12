import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

interface Technician {
  id: string
  name: string
  service: string
  rating: number
  reviews: number
  hourlyRate: number
  distance: string
  avatar: string
  skills: string[]
  availability: string
}

// Mock technicians data
const MOCK_TECHNICIANS: Technician[] = [
  {
    id: '1',
    name: 'John Smith',
    service: 'Plumbing',
    rating: 4.8,
    reviews: 127,
    hourlyRate: 65,
    distance: '1.2 km',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    skills: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning'],
    availability: 'Available today',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    service: 'Electrical',
    rating: 4.9,
    reviews: 89,
    hourlyRate: 75,
    distance: '2.1 km',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    skills: ['Wiring', 'Circuit Installation', 'Electrical Repair'],
    availability: 'Available tomorrow',
  },
  {
    id: '3',
    name: 'Mike Davis',
    service: 'Cleaning',
    rating: 4.7,
    reviews: 203,
    hourlyRate: 45,
    distance: '0.8 km',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    skills: ['Deep Cleaning', 'Office Cleaning', 'Move-in/out'],
    availability: 'Available today',
  },
]

export default function Search() {
  const { category } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category || '')
  const [technicians, setTechnicians] = useState<Technician[]>(MOCK_TECHNICIANS)
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(MOCK_TECHNICIANS)

  useEffect(() => {
    filterTechnicians()
  }, [searchQuery, selectedCategory])

  const filterTechnicians = () => {
    let filtered = technicians

    if (selectedCategory) {
      filtered = filtered.filter(tech => 
        tech.service.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredTechnicians(filtered)
  }

  const renderTechnician = ({ item }: { item: Technician }) => (
    <TouchableOpacity 
      style={styles.technicianCard}
      onPress={() => router.push(`/technician/${item.id}`)}
    >
      <View style={styles.technicianHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.technicianInfo}>
          <Text style={styles.technicianName}>{item.name}</Text>
          <Text style={styles.technicianService}>{item.service}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews} reviews)</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.hourlyRate}>${item.hourlyRate}/hr</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <View style={styles.availabilityContainer}>
        <Ionicons name="time" size={16} color="#28a745" />
        <Text style={styles.availability}>{item.availability}</Text>
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
        <Text style={styles.headerTitle}>Find Technicians</Text>
        <TouchableOpacity onPress={() => router.push('/filters')}>
          <Ionicons name="options" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search technicians or services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {selectedCategory && (
        <View style={styles.categoryFilter}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{selectedCategory}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory('')}>
              <Ionicons name="close" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredTechnicians.length} technicians found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort by Rating</Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Technicians List */}
      <FlatList
        data={filteredTechnicians}
        renderItem={renderTechnician}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No technicians found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search criteria
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  technicianCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  technicianHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  technicianService: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviews: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#666',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availability: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
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