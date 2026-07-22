import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

// iOS-only for now — no Android RevenueCat key is provisioned yet.
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY

let configured = false

/**
 * Initializes RevenueCat and links purchases to the signed-in user. Pass the
 * Supabase user id as the RevenueCat appUserID so entitlements follow the
 * account across devices. Safe to call repeatedly — it configures only once.
 */
export async function configureRevenueCat(userId: string) {
  if (configured || Platform.OS !== 'ios' || !IOS_KEY) return
  configured = true
  if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.DEBUG)
  Purchases.configure({ apiKey: IOS_KEY, appUserID: userId })
}
