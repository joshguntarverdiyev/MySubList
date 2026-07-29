import { useState, useCallback } from 'react'
import { View, Text, ScrollView, Alert, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, router } from 'expo-router'
import { useUserId } from '@/hooks/useUserId'
import { useProfileStore } from '@/store/profileStore'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import ProfileCard from '@/components/profile/ProfileCard'
import ProfilePreferences from '@/components/profile/ProfilePreferences'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'
import InfoModal from '@/components/profile/InfoModal'
import DangerZone from '@/components/profile/DangerZone'
import { INFO } from '@/constants/legal'
import { sendTestReminder } from '@/services/testNotification' // TEMP: remove after build 7

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const userId = useUserId()
  const s = useProfileStore()
  const { chooseAvatar, uploading } = useAvatarUpload(userId)

  const [info, setInfo] = useState<keyof typeof INFO | null>(null)

  // Real name, falling back to the email's username, then a generic label.
  const displayName = s.full_name || s.email?.split('@')[0] || 'User'

  // TEMP (build 7): verify the renewal-reminder pipeline. Remove after testing.
  const handleTestReminder = async () => {
    const r = await sendTestReminder()
    Alert.alert(
      r === 'scheduled' ? 'Test reminder scheduled' : 'Notifications are off',
      r === 'scheduled'
        ? 'Background the app — it will fire in ~10 seconds. Tap it to confirm it opens Home.'
        : 'Enable notifications for MySubList in Settings, then try again.',
    )
  }

  useFocusEffect(
    useCallback(() => {
      if (userId) s.fetchProfile(userId)
    }, [userId]),
  )

  return (
    <View className="flex-1 bg-[#F7F3FD]">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[32px] font-bold tracking-[-0.8px] text-[#111827]">Profile & Settings</Text>
        <Text className="mb-6 mt-1 text-[15px] text-[#444952]">
          Manage your account and app preferences.
        </Text>

        <ProfileCard
          fullName={displayName}
          email={s.email}
          avatarUrl={s.avatar_url}
          isPremium={s.is_premium}
          uploading={uploading}
          onPressCard={() => router.push('/profile/account')}
          onPressCamera={chooseAvatar}
        />

        {!s.is_premium ? (
          <Pressable
            onPress={() => router.push('/paywall')}
            className="mt-4 flex-row items-center justify-between rounded-2xl border-l-4 border-[#7C4DFF] bg-white px-4 py-4"
          >
            <View className="flex-1 pr-3">
              <Text className="text-[15px] font-bold text-[#1A1A2E]">⭐ Upgrade to Pro</Text>
              <Text className="mt-0.5 text-[13px] text-[#6B7280]">
                Unlock unlimited subscriptions and AI advice
              </Text>
            </View>
            <Text className="text-[14px] font-bold text-[#7C4DFF]">Upgrade →</Text>
          </Pressable>
        ) : null}

        <ProfilePreferences userId={userId} />

        <SettingsCard title="SUPPORT & INFO">
          <SettingsRow icon="help-circle-outline" label="Help Center" subtitle="FAQs and support" divider onPress={() => setInfo('help')} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" subtitle="Read our terms and conditions" divider onPress={() => setInfo('terms')} />
          <SettingsRow icon="shield-outline" label="Privacy Policy" subtitle="How we protect your data" divider onPress={() => setInfo('privacy')} />
          <SettingsRow
            icon="information-circle-outline"
            label="About MySubList"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('MySubList v1.0.0', 'Built with Expo + Supabase + Gemini AI\n© 2026 MySubList')}
          />
        </SettingsCard>

        <DangerZone />

        {/* TEMPORARY — remove after build 7 notification testing */}
        <Pressable
          onPress={handleTestReminder}
          className="mt-4 flex-row items-center justify-center rounded-2xl border border-[#DAD5E8] bg-white px-4 py-4"
        >
          <Text className="text-[14px] font-semibold text-[#7C4DFF]">🔔 Send test reminder (10s)</Text>
        </Pressable>
      </ScrollView>

      <InfoModal
        visible={info !== null}
        entry={info ? INFO[info] : null}
        onClose={() => setInfo(null)}
      />
    </View>
  )
}
