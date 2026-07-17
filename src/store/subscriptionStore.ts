import { create } from 'zustand'
import type { Subscription } from '@/types/subscription'
import { getUserSubscriptions } from '@/services/subscriptions'

interface SubscriptionState {
  subscriptions: Subscription[]
  isLoading: boolean
  error: string | null
  fetchSubscriptions: (userId: string) => Promise<void>
  refreshSubscriptions: (userId: string) => Promise<void>
  reset: () => void
}

async function load(
  set: (partial: Partial<SubscriptionState>) => void,
  userId: string,
  showLoading: boolean
) {
  if (showLoading) set({ isLoading: true })
  set({ error: null })
  try {
    const subscriptions = await getUserSubscriptions(userId)
    set({ subscriptions, isLoading: false })
  } catch {
    set({ error: 'Could not load your subscriptions.', isLoading: false })
  }
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  isLoading: true,
  error: null,
  fetchSubscriptions: (userId) => load(set, userId, true),
  refreshSubscriptions: (userId) => load(set, userId, false),
  reset: () => set({ subscriptions: [], isLoading: false, error: null }),
}))
