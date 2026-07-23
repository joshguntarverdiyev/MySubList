import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases'
import { useProfileStore } from '@/store/profileStore'

// iOS-only for now — no Android RevenueCat key is provisioned yet.
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
const ENTITLEMENT = 'MySubList Pro'

let configured = false

/**
 * Mirror the local premium flag from RevenueCat's verified entitlement state.
 * This is the client's source of truth for premium UI — it's instant, unlike
 * profiles.is_premium (set by the webhook, which lags a few seconds).
 */
function syncPremium(info: CustomerInfo) {
  const active = info.entitlements.active[ENTITLEMENT] !== undefined
  useProfileStore.getState().setPremium(active)
}

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
  // Keep is_premium in sync with real entitlements: once now, then on every
  // change (purchase, restore, expiry) — no dependence on the webhook/DB lag.
  Purchases.addCustomerInfoUpdateListener(syncPremium)
  try {
    syncPremium(await Purchases.getCustomerInfo())
  } catch (e) {
    console.log('getCustomerInfo error:', e)
  }
}
