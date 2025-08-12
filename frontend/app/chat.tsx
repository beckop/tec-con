import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'

export default function Chat() {
  const { taskId, partnerId } = useLocalSearchParams<{ taskId: string; partnerId: string }>()
  const { profile } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [partnerProfile, setPartnerProfile] = useState<any>(null)

  const { messages, sendMessage, loading } = useChat(
    taskId || '', 
    partnerId || ''
  )

  useEffect(() => {
    if (partnerId) {
      fetchPartnerProfile()
    }
  }, [partnerId])

  const fetchPartnerProfile = async () => {
    try {
      // In a real app, you'd fetch the partner's profile from your API
      // For now, we'll create a mock profile
      setPartnerProfile({
        full_name: 'Chat Partner',
        username: 'chatpartner',
      })
    } catch (error) {
      console.error('Error fetching partner profile:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    try {
      await sendMessage(messageText.trim())
      setMessageText('')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {}
    
    messages.forEach((message) => {
      const dateKey = message.created_at.split('T')[0] // Get date part only
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {partnerProfile?.full_name || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>Task Chat</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/task/${taskId}`)}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView 
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ref={(ref) => {
            // Auto-scroll to bottom when new messages arrive
            if (ref && messages.length > 0) {
              setTimeout(() => {
                ref.scrollToEnd({ animated: true })
              }, 100)
            }
          }}
        >
          {loading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <View key={date}>
                {/* Date Separator */}
                <View style={styles.dateSeparator}>
                  <Text style={styles.dateText}>
                    {formatDate(date)}
                  </Text>
                </View>

                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isMyMessage = message.sender_id === profile?.id
                  
                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.messageContainer,
                        isMyMessage ? styles.myMessage : styles.theirMessage
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          isMyMessage ? styles.myBubble : styles.theirBubble
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          isMyMessage ? styles.myMessageText : styles.theirMessageText
                        ]}>
                          {message.content}
                        </Text>
                        <Text style={[
                          styles.messageTime,
                          isMyMessage ? styles.myMessageTime : styles.theirMessageTime
                        ]}>
                          {formatTime(message.created_at)}
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            ))
          )}

          {messages.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start the conversation by sending a message
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={messageText.trim() ? '#fff' : '#ccc'} 
              />
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageContainer: {
    marginVertical: 2,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 2,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  myMessageTime: {
    color: '#fff',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: '#333',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
})