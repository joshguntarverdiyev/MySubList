import * as Notifications from 'expo-notifications'
import { Alert } from 'react-native'

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
 * Show a contextual pre-permission Alert explaining *why* we want to notify,
 * then trigger the system permission dialog only if the user opts in. Following
 * this "prime before prompt" pattern reduces the OS-level denial rate. Resolves
 * true only if permission ends up granted.
 */
export function primeAndRequestPermission(): Promise<boolean> {
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
