import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  /** Current authenticated user's id, or null while unknown / signed out. */
  userId: string | null
}

export const useAuthStore = create<AuthState>(() => ({
  userId: null,
}))

// One session listener for the whole app. Screens read the id via useUserId(),
// so this replaces the per-screen getSession + onAuthStateChange that each call
// site used to spin up. Runs once when this module is first imported.
;(async () => {
  const { data } = await supabase.auth.getSession()
  useAuthStore.setState({ userId: data.session?.user.id ?? null })
})()

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ userId: session?.user.id ?? null })
})
