import * as Notifications from 'expo-notifications'
import { Alert, Platform } from 'react-native'
import { set } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { computeNextRenewalDate } from '@/utils/renewalDates'
import { formatCurrency } from '@/utils/currency'
import type { Subscription } from '@/types/subscription'

const ANDROID_CHANNEL_ID = 'renewals'

/**
 * Android 8+ requires notifications to belong to a channel. Idempotent —
 * safe to call before every schedule. No-op on iOS.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Renewal reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#7C4DFF',
  })
}

/**
 * Request notification permission from the user. Only call this in context
 * (e.g. after adding a first subscription) — never on app launch. Returns
 * true if granted, false if denied.
 */
export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Compute the reminder trigger date for a subscription: the next renewal
 * (rolled forward to on-or-after today) minus the user's lead time, at 9 AM.
 * Free-trial subs bill from their trial end date. Returns null when there is
 * no future reminder to schedule.
 */
function reminderTiming(
  sub: Subscription
): { remind: Date; daysBefore: number } | null {
  if (sub.billing_period === 'once') return null

  // A trial isn't charged until it ends — bill from trial_end_date if present.
  const scheduleStart =
    sub.is_free_trial && sub.trial_end_date ? sub.trial_end_date : sub.start_date
  const renewal = computeNextRenewalDate(scheduleStart, sub.billing_period)

  const daysBefore = useProfileStore.getState().notification_days_before ?? 2
  const remind = set(renewal, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 })
  remind.setDate(remind.getDate() - daysBefore)

  // Don't schedule a reminder whose fire time has already passed.
  if (remind.getTime() <= Date.now()) return null
  return { remind, daysBefore }
}

/**
 * Schedule a local renewal reminder for a subscription. Returns the scheduled
 * notification identifier, or null if nothing should be scheduled (one-time
 * sub, or the reminder date is already in the past).
 */
export async function scheduleRenewalReminder(
  sub: Subscription
): Promise<string | null> {
  const timing = reminderTiming(sub)
  if (!timing) return null
  const { remind, daysBefore } = timing

  await ensureAndroidChannel()

  const price = formatCurrency(sub.price, sub.currency)
  const dayLabel = daysBefore === 1 ? 'day' : 'days'

  return Notifications.scheduleNotificationAsync({
    content: {
      title: sub.name,
      body: `${sub.name} renews after ${daysBefore} ${dayLabel} — ${price}`,
      data: { subscriptionId: sub.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: remind,
      channelId: ANDROID_CHANNEL_ID,
    },
  })
}

/**
 * Show a contextual pre-permission Alert explaining *why* we want to notify,
 * then trigger the system permission dialog only if the user opts in. Following
 * this "prime before prompt" pattern reduces the OS-level denial rate. Resolves
 * true only if permission ends up granted.
 */
function primeAndRequestPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Stay on top of renewals',
      "Get notified before your subscriptions renew so you're never caught off guard.",
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Enable notifications',
          onPress: async () => resolve(await requestPermission()),
        },
      ],
    )
  })
}

/**
 * Post-insert orchestration for a newly added subscription. Requests
 * notification permission in context (with a priming Alert) whenever it hasn't
 * been decided yet — the OS only shows its dialog once, so an already-denied
 * user is never nagged again. Schedules the reminder if permission is granted.
 * Returns the scheduled notification identifier to persist, or null.
 */
export async function scheduleNewSubscriptionReminder(
  sub: Subscription
): Promise<string | null> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync()
  let granted = status === 'granted'

  // Only prime + prompt when the OS will actually surface a dialog (permission
  // still undetermined). If the user previously denied, stay silent.
  if (!granted && canAskAgain) {
    granted = await primeAndRequestPermission()
  }

  if (!granted) return null
  return scheduleRenewalReminder(sub)
}

/** Cancel a specific scheduled notification by its identifier. */
export async function cancelRenewalReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}

/**
 * Cancel a subscription's existing reminder (if any) and schedule a fresh one
 * with its current dates/lead time. Returns the new identifier, or null.
 */
export async function rescheduleRenewalReminder(
  sub: Subscription
): Promise<string | null> {
  if (sub.notification_id) {
    await cancelRenewalReminder(sub.notification_id)
  }
  return scheduleRenewalReminder(sub)
}

/** Cancel every scheduled reminder. Used when deleting the account. */
export async function cancelAllRenewalReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Reschedule reminders for all active subscriptions and persist the new
 * notification identifiers back to Supabase. Called after the user changes
 * their notification lead time so every reminder shifts to the new timing.
 */
export async function rescheduleAllReminders(subs: Subscription[]): Promise<void> {
  for (const sub of subs) {
    if (!sub.is_active) continue
    const notifId = await rescheduleRenewalReminder(sub)
    if (notifId !== sub.notification_id) {
      await supabase
        .from('subscriptions')
        .update({ notification_id: notifId })
        .eq('id', sub.id)
    }
  }
}
