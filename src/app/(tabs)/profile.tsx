import { useState, useCallback } from 'react'
import { View, Text, ScrollView, Alert, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useUserId } from '@/hooks/useUserId'
import { useProfileStore } from '@/store/profileStore'
import { getUserSubscriptions } from '@/services/subscriptions'
import { rescheduleAllReminders } from '@/services/notifications'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import ProfileCard from '@/components/profile/ProfileCard'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'
import OptionSheet from '@/components/profile/OptionSheet'
import InfoModal from '@/components/profile/InfoModal'
import DangerZone from '@/components/profile/DangerZone'
import {
  NOTIFICATION_OPTIONS,
  CURRENCY_OPTIONS,
  FIRST_DAY_OPTIONS,
  notificationLabel,
  currencyLabel,
  firstDayLabel,
} from '@/constants/preferenceOptions'
import { INFO } from '@/constants/legal'
import { FREE_CURRENCIES, isCurrencyLocked } from '@/constants/subscriptionOptions'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const userId = useUserId()
  const s = useProfileStore()
  const { chooseAvatar, uploading } = useAvatarUpload(userId)

  const [sheet, setSheet] = useState<'notif' | 'currency' | 'firstDay' | null>(null)
  const [info, setInfo] = useState<keyof typeof INFO | null>(null)

  // Real name, falling back to the email's username, then a generic label.
  const displayName = s.full_name || s.email?.split('@')[0] || 'User'

  useFocusEffect(
    useCallback(() => {
      if (userId) s.fetchProfile(userId)
    }, [userId]),
  )

  const persist = useCallback(
    async (patch: Record<string, unknown>, apply: () => void) => {
      apply()
      setSheet(null)
      if (userId) await supabase.from('profiles').update(patch).eq('id', userId)
    },
    [userId],
  )

  // Changing the lead time must reschedule every active reminder to the new
  // timing. Runs after the preference is saved (setNotificationDays already
  // applied, so scheduleRenewalReminder reads the updated value).
  const persistNotificationDays = useCallback(
    async (days: number) => {
      await persist({ notification_days_before: days }, () => s.setNotificationDays(days))
      if (!userId) return
      const subs = await getUserSubscriptions(userId)
      await rescheduleAllReminders(subs)
    },
    [persist, userId, s],
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
            onPress={() => router.push('/paywall' as any)}
            className="mt-4 flex-row items-center justify-between rounded-2xl border-l-4 border-[#6C47D9] bg-white px-4 py-4"
          >
            <View className="flex-1 pr-3">
              <Text className="text-[15px] font-bold text-[#1A1A2E]">⭐ Upgrade to Pro</Text>
              <Text className="mt-0.5 text-[13px] text-[#6B7280]">
                Unlock unlimited subscriptions and AI advice
              </Text>
            </View>
            <Text className="text-[14px] font-bold text-[#6C47D9]">Upgrade →</Text>
          </Pressable>
        ) : null}

        <SettingsCard title="PREFERENCES">
          <SettingsRow
            icon="globe-outline"
            label="Languages"
            value="English"
            divider
            onPress={() => Alert.alert('Languages', 'English is the only language available in v1.')}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notification"
            value={notificationLabel(s.notification_days_before)}
            divider
            onPress={() => setSheet('notif')}
          />
          <SettingsRow
            icon="cash-outline"
            label="Currency"
            value={currencyLabel(s.currency)}
            divider
            onPress={() => setSheet('currency')}
          />
          <SettingsRow
            icon="calendar-outline"
            label="First day of week"
            value={firstDayLabel(s.first_day_of_week)}
            onPress={() => setSheet('firstDay')}
          />
        </SettingsCard>

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
      </ScrollView>

      <OptionSheet
        visible={sheet === 'notif'}
        title="Notify me before renewal"
        options={NOTIFICATION_OPTIONS}
        selected={s.notification_days_before}
        onSelect={(v) => persistNotificationDays(v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'currency'}
        title="Currency"
        options={CURRENCY_OPTIONS}
        selected={s.currency}
        lockedValues={s.is_premium ? [] : CURRENCY_OPTIONS.map((o) => o.value).filter((v) => !FREE_CURRENCIES.includes(v))}
        onSelect={(v) => {
          if (isCurrencyLocked(v, s.is_premium)) {
            setSheet(null)
            router.push('/paywall' as any)
          } else {
            persist({ currency: v }, () => s.setCurrency(v))
          }
        }}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'firstDay'}
        title="First day of week"
        options={FIRST_DAY_OPTIONS}
        selected={s.first_day_of_week}
        onSelect={(v) => persist({ first_day_of_week: v }, () => s.setFirstDayOfWeek(v))}
        onClose={() => setSheet(null)}
      />

      <InfoModal
        visible={info !== null}
        entry={info ? INFO[info] : null}
        onClose={() => setInfo(null)}
      />
    </View>
  )
}
