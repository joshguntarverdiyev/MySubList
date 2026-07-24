import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'
import { deleteAccount } from '@/services/account'
import { cancelAllRenewalReminders } from '@/services/notifications'
import { useProfileStore } from '@/store/profileStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'

export default function PrivacySecurityScreen() {
  const insets = useSafeAreaInsets()

  async function runDelete() {
    try {
      await cancelAllRenewalReminders()
      await deleteAccount()
      useProfileStore.getState().reset()
      useSubscriptionStore.getState().reset()
      await SecureStore.deleteItemAsync('onboarding_complete')
      router.replace('/(onboarding)/welcome')
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your subscription data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: runDelete },
      ],
    )
  }

  return (
    <View className="flex-1 bg-[#F7F3FD]">
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center px-5 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
        </Pressable>
        <Text className="ml-3 text-[20px] font-bold text-[#111827]">Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}>
        <SettingsCard title="YOUR DATA">
          <SettingsRow icon="server-outline" label="Data Storage" subtitle="Your data is stored securely on Supabase servers" hideChevron divider />
          <SettingsRow icon="shield-checkmark-outline" label="Encryption" subtitle="All data is encrypted in transit and at rest" hideChevron divider />
          <SettingsRow icon="eye-off-outline" label="Data Sharing" subtitle="We never sell your data to third parties" hideChevron />
        </SettingsCard>

        <SettingsCard title="YOUR RIGHTS">
          <SettingsRow icon="download-outline" label="Privacy Policy" subtitle="Read our full privacy policy" divider onPress={() => Linking.openURL('https://mysublist.app/privacy')} />
          <SettingsRow icon="mail-outline" label="Data Request" subtitle="Request a copy of your data" onPress={() => Linking.openURL('mailto:hello@mysublist.app?subject=Data Request')} />
        </SettingsCard>

        <SettingsCard title="DANGER ZONE">
          <SettingsRow icon="trash-outline" label="Delete Account" subtitle="Permanently delete your account and all data" labelColor="#EF4444" iconColor="#EF4444" iconBg="#FEF2F2" onPress={confirmDelete} />
        </SettingsCard>
      </ScrollView>
    </View>
  )
}
