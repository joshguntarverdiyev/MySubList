import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface ProfileState {
  currency: string
  loaded: boolean
  fetchProfile: (userId: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  currency: 'EUR',
  loaded: false,
  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', userId)
      .single()
    // Fall back to EUR on any error or missing row — never block the UI.
    if (error || !data?.currency) {
      set({ loaded: true })
      return
    }
    set({ currency: data.currency, loaded: true })
  },
}))
