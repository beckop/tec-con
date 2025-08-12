import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

interface TechnicianDetails {
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
  bio: string
  experience: string
  completedJobs: number
  responseTime: string
  portfolio: string[]
}

// Mock technician data
const MOCK_TECHNICIAN: TechnicianDetails = {
  id: '1',
  name: 'John Smith',
  service: 'Plumbing',
  rating: 4.8,
  reviews: 127,
  hourlyRate: 65,
  distance: '1.2 km',
  avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  skills: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Repair', 'Toilet Installation'],
  availability: 'Available today',
  bio: 'Experienced plumber with over 10 years in residential and commercial plumbing. Specializing in emergency repairs and new installations.',
  experience: '10+ years',
  completedJobs: 245,
  responseTime: 'Usually responds within 1 hour',
  portfolio: [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  ]
}

const REVIEWS = [
  {
    id: '1',
    name: 'Sarah M.',
    rating: 5,
    date: '2 days ago',
    comment: 'Excellent work! Fixed my kitchen sink quickly and professionally.',
  },
  {
    id: '2',
    name: 'Mike R.',
    rating: 5,
    date: '1 week ago',
    comment: 'Very knowledgeable and fair pricing. Highly recommend!',
  },
  {
    id: '3',
    name: 'Lisa K.',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Good service, arrived on time and cleaned up after the job.',
  },
]

export default function TechnicianProfile() {
  const { id } = useLocalSearchParams()
  const [technician] = useState<TechnicianDetails>(MOCK_TECHNICIAN)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const handleBookNow = () => {
    Alert.alert(
      'Book Service',
      `Would you like to book ${technician.name} for ${technician.service}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => router.push(`/booking/${technician.id}`)
        },
      ]
    )
  }

  const handleMessage = () => {
    router.push(`/chat/${technician.id}`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ))
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: technician.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{technician.name}</Text>
          <Text style={styles.service}>{technician.service}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(technician.rating)}
            </View>
            <Text style={styles.rating}>{technician.rating}</Text>
            <Text style={styles.reviews}>({technician.reviews} reviews)</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{technician.completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{technician.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{technician.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{technician.bio}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#28a745" />
            <Text style={styles.infoText}>{technician.availability}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
            <Text style={styles.infoText}>{technician.responseTime}</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Services</Text>
          <View style={styles.skillsContainer}>
            {technician.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.portfolioContainer}>
              {technician.portfolio.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.portfolioImage} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews ({technician.reviews})</Text>
            <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
              <Text style={styles.seeAllText}>
                {showAllReviews ? 'Show Less' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {REVIEWS.slice(0, showAllReviews ? REVIEWS.length : 2).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>${technician.hourlyRate}/hr</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  service: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 14,
    color: '#666',
  },
  portfolioContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  portfolioImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomActions: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})