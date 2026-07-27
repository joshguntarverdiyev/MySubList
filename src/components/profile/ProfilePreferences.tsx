import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { getUserSubscriptions } from '@/services/subscriptions'
import { rescheduleAllReminders } from '@/services/notifications'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'
import OptionSheet from '@/components/profile/OptionSheet'
import {
  NOTIFICATION_OPTIONS,
  CURRENCY_OPTIONS,
  FIRST_DAY_OPTIONS,
  notificationLabel,
  currencyLabel,
  firstDayLabel,
} from '@/constants/preferenceOptions'
import { FREE_CURRENCIES, isCurrencyLocked } from '@/constants/subscriptionOptions'

/**
 * The PREFERENCES section: notification lead time, currency, and first-day-of-week
 * rows plus their bottom sheets, and the persistence logic that writes changes to
 * Supabase (optimistically applying them to the profile store first).
 */
export default function ProfilePreferences({ userId }: { userId: string | null }) {
  const s = useProfileStore()
  const [sheet, setSheet] = useState<'notif' | 'currency' | 'firstDay' | null>(null)

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
    <>
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
            router.push('/paywall')
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
    </>
  )
}
