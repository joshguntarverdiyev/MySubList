import { create } from 'zustand'
import { fetchRates } from '@/lib/exchangeRates'

interface RatesState {
  rates: Record<string, number>
  date: string | null
  loaded: boolean
  fetchRates: () => Promise<void>
}

export const useRatesStore = create<RatesState>((set) => ({
  rates: {},
  date: null,
  loaded: false,
  fetchRates: async () => {
    try {
      const { date, rates } = await fetchRates()
      set({ rates, date, loaded: true })
    } catch {
      // Leave rates empty → conversion falls back to 1:1 ("approx." label).
      set({ loaded: false })
    }
  },
}))
