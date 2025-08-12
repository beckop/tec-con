import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { router } from 'expo-router'
import { ActivityIndicator } from 'react-native'

export default function Index() {
  const { session, loading, profile } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace('/auth')
      } else if (!profile) {
        router.replace('/setup-profile')
      } else {
        router.replace('/home')
      }
    }
  }, [session, loading, profile])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return <View style={styles.container} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})