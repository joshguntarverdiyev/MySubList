import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface ProfileState {
  currency: string
  first_day_of_week: number
  loaded: boolean
  fetchProfile: (userId: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  currency: 'EUR',
  first_day_of_week: 1,
  loaded: false,
  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('currency, first_day_of_week')
      .eq('id', userId)
      .single()
    // Fall back to defaults on any error or missing row — never block the UI.
    if (error || !data) {
      set({ loaded: true })
      return
    }
    set({
      currency: data.currency ?? 'EUR',
      first_day_of_week: data.first_day_of_week ?? 1,
      loaded: true,
    })
  },
}))
