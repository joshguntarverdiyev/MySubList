import { useState, useCallback } from 'react'
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { deleteAccount } from '@/services/account'
import SettingsCard from './SettingsCard'
import SettingsRow from './SettingsRow'

/** Clear all cached user state after signing out or deleting the account. */
function clearStores() {
  useProfileStore.getState().reset()
  useSubscriptionStore.getState().reset()
}

export default function DangerZone() {
  const [deleting, setDeleting] = useState(false)

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          clearStores()
          router.replace('/(auth)/sign-in')
        },
      },
    ])
  }, [])

  const runDelete = useCallback(async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      clearStores()
      await SecureStore.deleteItemAsync('onboarding_complete')
      router.replace('/(onboarding)/welcome')
    } catch {
      setDeleting(false)
      Alert.alert('Error', 'Something went wrong. Please try again or contact support.')
    }
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleting) return
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Permanently Delete Everything?',
              'This will permanently delete ALL your data including all subscriptions, AI chat history, and your account. You cannot recover this data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Everything', style: 'destructive', onPress: runDelete },
              ],
            ),
        },
      ],
    )
  }, [deleting, runDelete])

  return (
    <View>
      <SettingsCard title="ACCOUNT">
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          labelColor="#EF4444"
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          hideChevron
          onPress={confirmSignOut}
        />
      </SettingsCard>

      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        className="mt-6 flex-row items-center justify-center py-2"
      >
        {deleting && <ActivityIndicator size="small" color="#EF4444" style={{ marginRight: 8 }} />}
        <Text className="text-[14px] text-[#EF4444] opacity-80">
          {deleting ? 'Deleting…' : 'Delete Account'}
        </Text>
      </Pressable>
    </View>
  )
}
