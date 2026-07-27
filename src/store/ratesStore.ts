import { create } from 'zustand'
import { fetchRates } from '@/lib/exchangeRates'

// UTC day key — Frankfurter/ECB rates are published once per (UTC) day, so we
// only need to fetch once per day regardless of how often screens gain focus.
const todayKey = () => new Date().toISOString().slice(0, 10)

interface RatesState {
  rates: Record<string, number>
  date: string | null
  loaded: boolean
  lastFetchedDay: string | null
  fetchRates: (force?: boolean) => Promise<void>
}

export const useRatesStore = create<RatesState>((set, get) => ({
  rates: {},
  date: null,
  loaded: false,
  lastFetchedDay: null,
  fetchRates: async (force = false) => {
    // Skip the network entirely if today's rates are already loaded. Screens
    // call this on every focus; without this guard each tab switch re-hit the API.
    if (!force && get().loaded && get().lastFetchedDay === todayKey()) return
    try {
      const { date, rates } = await fetchRates()
      set({ rates, date, loaded: true, lastFetchedDay: todayKey() })
    } catch {
      // Leave rates empty → conversion falls back to 1:1 ("approx." label).
      // Don't stamp lastFetchedDay so the next focus retries.
      set({ loaded: false })
    }
  },
}))
