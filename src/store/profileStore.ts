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
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, currency, first_day_of_week, notification_days_before, is_premium')
      .eq('id', userId)
      .single()
    // Email lives on the auth user, not the profiles row.
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email ?? ''
    // Fall back to defaults on any error or missing row — never block the UI.
    if (error || !data) {
      set({ email, loaded: true })
      return
    }
    set({
      full_name: data.full_name ?? '',
      email,
      avatar_url: data.avatar_url ?? null,
      currency: data.currency ?? 'EUR',
      first_day_of_week: data.first_day_of_week ?? 1,
      notification_days_before: data.notification_days_before ?? 2,
      is_premium: data.is_premium ?? false,
      loaded: true,
    })
  },
  setCurrency: (currency) => set({ currency }),
  setFirstDayOfWeek: (first_day_of_week) => set({ first_day_of_week }),
  setNotificationDays: (notification_days_before) => set({ notification_days_before }),
  setAvatarUrl: (avatar_url) => set({ avatar_url }),
  // Update the local cache immediately, then sync to Supabase. RevenueCat is the
  // source of truth for entitlements; profiles.is_premium is just a cache.
  setPremium: async (value) => {
    set({ is_premium: value })
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (userId) await supabase.from('profiles').update({ is_premium: value }).eq('id', userId)
  },
  reset: () => set({ ...DEFAULTS }),
}))
