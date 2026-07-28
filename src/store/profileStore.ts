import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface ProfileState {
  full_name: string
  email: string
  avatar_url: string | null
  currency: string
  first_day_of_week: number
  notification_days_before: number
  is_premium: boolean
  loaded: boolean
  fetchProfile: (userId: string) => Promise<void>
  setFullName: (name: string) => void
  setCurrency: (currency: string) => void
  setFirstDayOfWeek: (day: number) => void
  setNotificationDays: (days: number) => void
  setAvatarUrl: (url: string | null) => void
  setPremium: (value: boolean) => Promise<void>
  reset: () => void
}

const DEFAULTS = {
  full_name: '',
  email: '',
  avatar_url: null,
  currency: 'EUR',
  first_day_of_week: 1,
  notification_days_before: 2,
  is_premium: false,
  loaded: false,
}

export const useProfileStore = create<ProfileState>((set) => ({
  ...DEFAULTS,
  fetchProfile: async (userId) => {
    // Fetch the profile row and the auth user in parallel — the email lives on
    // the auth user, not the profiles row.
    const [{ data, error }, { data: userData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, avatar_url, currency, first_day_of_week, notification_days_before, is_premium')
        .eq('id', userId)
        .single(),
      supabase.auth.getUser(),
    ])
    const email = userData.user?.email ?? ''
    // The real name the user typed at sign-up lives in auth user_metadata. The
    // DB trigger that creates the profiles row can default full_name to the email
    // prefix, so prefer metadata whenever the stored name is blank or matches the
    // email prefix, and backfill the profiles row so it self-heals.
    const metaName = (userData.user?.user_metadata?.full_name as string | undefined)?.trim() ?? ''
    // Fall back to defaults on any error or missing row — never block the UI.
    if (error || !data) {
      set({ email, full_name: metaName, loaded: true })
      return
    }
    // NB: is_premium is intentionally NOT set here. The client's premium flag is
    // owned by RevenueCat (see configureRevenueCat) so the webhook/DB lag can't
    // clobber the UI after a purchase. The DB is_premium is for server-side
    // enforcement only (AI limit, sub-limit trigger).
    const storedName = (data.full_name ?? '').trim()
    const emailPrefix = email.split('@')[0]
    const nameLooksAuto = !storedName || storedName === emailPrefix
    const full_name = nameLooksAuto && metaName ? metaName : storedName
    // Persist the corrected name so the DB matches the UI and future reads are clean.
    if (full_name && full_name !== storedName) {
      await supabase.from('profiles').update({ full_name }).eq('id', userId)
    }
    set({
      full_name,
      email,
      avatar_url: data.avatar_url ?? null,
      currency: data.currency ?? 'EUR',
      first_day_of_week: data.first_day_of_week ?? 1,
      notification_days_before: data.notification_days_before ?? 2,
      loaded: true,
    })
  },
  setFullName: (full_name) => set({ full_name }),
  setCurrency: (currency) => set({ currency }),
  setFirstDayOfWeek: (first_day_of_week) => set({ first_day_of_week }),
  setNotificationDays: (notification_days_before) => set({ notification_days_before }),
  setAvatarUrl: (avatar_url) => set({ avatar_url }),
  // Local cache only, for instant UX right after a purchase/restore. The durable
  // profiles.is_premium flag is set SERVER-SIDE by the RevenueCat webhook —
  // clients can no longer write it (a DB trigger blocks it). Kept async so
  // existing call sites (`await setPremium(true)`) don't need to change.
  setPremium: async (value) => {
    set({ is_premium: value })
  },
  reset: () => set({ ...DEFAULTS }),
}))
