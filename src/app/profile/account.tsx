import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'
import EmailChangeForm from '@/components/account/EmailChangeForm'

export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const email = useProfileStore((s) => s.email)
  const [emailOpen, setEmailOpen] = useState(false)

  // Reuses the existing forgot/reset-password flow (deep-link handled in _layout).
  async function changePassword() {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'mysublist://reset-password' })
    Alert.alert('Check your inbox', `Password reset link sent to ${email}. Check your inbox to set a new password.`)
  }

  return (
    <View className="flex-1 bg-[#F7F3FD]">
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center px-5 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
        </Pressable>
        <Text className="ml-3 text-[20px] font-bold text-[#111827]">Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <SettingsCard title="ACCOUNT">
          <SettingsRow icon="mail-outline" label="Email" subtitle={email} divider onPress={() => setEmailOpen(true)} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" divider onPress={changePassword} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => router.push('/profile/privacy-security' as any)} />
        </SettingsCard>
      </ScrollView>

      <EmailChangeForm visible={emailOpen} currentEmail={email} onClose={() => setEmailOpen(false)} />
    </View>
  )
}
