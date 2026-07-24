import { useCallback } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import SettingsCard from './SettingsCard'
import SettingsRow from './SettingsRow'

/** Clear all cached user state after signing out. */
function clearStores() {
  useProfileStore.getState().reset()
  useSubscriptionStore.getState().reset()
}

export default function DangerZone() {
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

  return (
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
  )
}
