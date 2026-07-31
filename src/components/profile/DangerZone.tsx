import { useCallback } from 'react'
import { Alert } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '@/lib/supabase'
import { deleteAccount } from '@/services/account'
import { cancelAllRenewalReminders } from '@/services/notifications'
import SettingsCard from './SettingsCard'
import SettingsRow from './SettingsRow'

export default function DangerZone() {
  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        // signOut fires SIGNED_OUT — authStore clears the per-user stores and
        // _layout routes to sign-in.
        onPress: async () => {
          await supabase.auth.signOut()
        },
      },
    ])
  }, [])

  const runDelete = useCallback(async () => {
    try {
      await cancelAllRenewalReminders()
      await deleteAccount()
      // Reset onboarding so a future fresh sign-up sees it again.
      await SecureStore.deleteItemAsync('onboarding_complete')
      // signOut fires SIGNED_OUT → authStore clears stores, _layout routes to
      // sign-in. (No manual navigation — the auth listener owns routing.)
      await supabase.auth.signOut()
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }, [])

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your subscription data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: runDelete },
      ],
    )
  }, [runDelete])

  return (
    <SettingsCard title="ACCOUNT">
      <SettingsRow
        icon="log-out-outline"
        label="Sign Out"
        labelColor="#EF4444"
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        hideChevron
        divider
        onPress={confirmSignOut}
      />
      <SettingsRow
        icon="trash-outline"
        label="Delete Account"
        subtitle="Permanently delete your account and all data"
        labelColor="#EF4444"
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        hideChevron
        onPress={confirmDelete}
      />
    </SettingsCard>
  )
}
