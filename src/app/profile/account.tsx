import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useProfileStore } from '@/store/profileStore'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'
import EmailChangeForm from '@/components/account/EmailChangeForm'
import UsernameChangeForm from '@/components/account/UsernameChangeForm'
import PasswordResetSheet from '@/components/auth/PasswordResetSheet'

export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const email = useProfileStore((s) => s.email)
  const fullName = useProfileStore((s) => s.full_name)
  const isPremium = useProfileStore((s) => s.is_premium)
  const [emailOpen, setEmailOpen] = useState(false)
  const [usernameOpen, setUsernameOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const displayName = fullName || email?.split('@')[0] || 'User'

  return (
    <View className="flex-1 bg-[#F7F3FD]">
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center px-5 pb-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
        >
          <Ionicons name="arrow-back" size={22} color="#7C4DFF" />
        </Pressable>
        <Text className="ml-3 text-[20px] font-bold text-[#111827]">Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <SettingsCard title="ACCOUNT">
          <SettingsRow icon="person-outline" label="Username" subtitle={displayName} divider onPress={() => setUsernameOpen(true)} />
          <SettingsRow icon="mail-outline" label="Email" subtitle={email} divider onPress={() => setEmailOpen(true)} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" divider onPress={() => setPasswordOpen(true)} />
          {isPremium ? (
            <SettingsRow
              icon="card-outline"
              label="Manage Subscription"
              subtitle="Cancel or change your plan in the App Store"
              divider
              onPress={() => Linking.openURL('itms-apps://apps.apple.com/account/subscriptions')}
            />
          ) : null}
          <SettingsRow icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => router.push('/profile/privacy-security')} />
        </SettingsCard>
      </ScrollView>

      <UsernameChangeForm visible={usernameOpen} currentName={fullName} onClose={() => setUsernameOpen(false)} />
      <EmailChangeForm visible={emailOpen} currentEmail={email} onClose={() => setEmailOpen(false)} />
      <PasswordResetSheet visible={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password" email={email} />
    </View>
  )
}
