import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { primeAndRequestPermission } from '@/services/notificationPermissions'

// ⚠️ TEMPORARY (build 7 testing only) — delete this file and its Profile button
// once the renewal-reminder pipeline is verified. Fires a sample reminder ~10s
// out so permission → banner → tap-to-Home can be checked without waiting for the
// real 9 AM trigger.
export async function sendTestReminder(): Promise<'scheduled' | 'denied'> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync()
  let granted = status === 'granted'
  if (!granted && canAskAgain) granted = await primeAndRequestPermission()
  if (!granted) return 'denied'

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('renewals', {
      name: 'Renewal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#7C4DFF',
    })
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Netflix',
      body: 'Netflix renews after 2 days — €12.99',
      data: { test: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: 'renewals',
    },
  })
  return 'scheduled'
}
