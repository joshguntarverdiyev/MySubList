import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { logOutRevenueCat } from '@/lib/revenuecat'

interface AuthState {
  /** Current authenticated user's id, or null while unknown / signed out. */
  userId: string | null
  /**
   * Timestamp bumped when an email change is confirmed via deep link. Screens
   * (e.g. the email-change sheet) subscribe to auto-dismiss when it changes.
   */
  emailChangedAt: number
}

export const useAuthStore = create<AuthState>(() => ({
  userId: null,
  emailChangedAt: 0,
}))

// One session listener for the whole app. Screens read the id via useUserId(),
// so this replaces the per-screen getSession + onAuthStateChange that each call
// site used to spin up. Runs once when this module is first imported.
;(async () => {
  const { data } = await supabase.auth.getSession()
  useAuthStore.setState({ userId: data.session?.user.id ?? null })
})()

// Clear all per-user cached state. Runs whenever the authenticated user id
// changes (sign-out or switching accounts) so one account never sees another's
// cached profile/subscriptions. Lives here — the single global auth listener —
// instead of only in the manual Sign Out button, so an expired/revoked session
// clears state too.
function clearUserState() {
  useProfileStore.getState().reset()
  useSubscriptionStore.getState().reset()
}

supabase.auth.onAuthStateChange((_event, session) => {
  const nextId = session?.user.id ?? null
  const prevId = useAuthStore.getState().userId
  if (nextId === prevId) return // token refresh / same user — nothing to clear

  useAuthStore.setState({ userId: nextId })
  // A real user was replaced (account switch or sign-out) — drop their cached
  // data. Skip the initial null->id sign-in, where there's no prior account.
  if (prevId !== null) clearUserState()
  // On sign-out, detach RevenueCat so the next account's entitlements resolve to
  // the right appUserID (configureRevenueCat does a fresh logIn on next sign-in).
  if (nextId === null) logOutRevenueCat()
})
