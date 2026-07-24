import {
  addMonths, addWeeks, addYears, endOfDay, endOfMonth, format,
  isAfter, isBefore, parseISO, startOfDay, startOfMonth, subDays, subMonths,
} from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { POPULAR_SERVICES } from '@/constants/services'
import { makeConverter, type Converter } from '@/utils/convert'
import { categoryColor } from '@/constants/analyticsColors'

export type Rates = Record<string, number>
export type Period = 'weekly' | 'monthly' | 'yearly'
export interface TrendPoint { label: string; value: number }
export interface CategorySlice { category: string; amount: number; percentage: number; color: string }
export interface Insights {
  mostExpensiveCategory: string
  yearlyProjection: number
  cheapestMonth: string
  mostExpensiveSub: string
}

const WEEKS_PER_MONTH = 52 / 12
const STEP_CAP = 2400

const active = (subs: Subscription[]) => subs.filter((s) => s.is_active)

/** A sub's cost normalized to a monthly figure in the target currency. once → 0. */
function monthlyEquivalent(sub: Subscription, conv: Converter): number {
  if (sub.billing_period === 'once') return 0
  const price = conv(sub.price, sub.currency)
  if (sub.billing_period === 'weekly') return price * WEEKS_PER_MONTH
  if (sub.billing_period === 'yearly') return price / 12
  return price
}

/** Category from the brand catalog (by brand_key), else the stored value, else Other. */
function categoryOf(sub: Subscription): string {
  return POPULAR_SERVICES.find((s) => s.brandKey === sub.brand_key)?.category ?? sub.category ?? 'Other'
}

/** Number of charge occurrences for a sub within [start, end]. */
function occurrencesInRange(sub: Subscription, start: Date, end: Date): number {
  if (!sub.is_active) return 0
  const from = sub.is_free_trial && sub.trial_end_date ? parseISO(sub.trial_end_date) : parseISO(sub.start_date)
  if (sub.billing_period === 'once') return !isBefore(from, start) && !isAfter(from, end) ? 1 : 0
  const step = sub.billing_period === 'weekly' ? addWeeks : sub.billing_period === 'yearly' ? addYears : addMonths
  let d = from
  let steps = 0
  while (isBefore(d, start) && steps < STEP_CAP) { d = step(d, 1); steps++ }
  let count = 0
  while (!isAfter(d, end) && steps < STEP_CAP) { count++; d = step(d, 1); steps++ }
  return count
}

const totalMonthly = (subs: Subscription[], conv: Converter) =>
  active(subs).reduce((sum, s) => sum + monthlyEquivalent(s, conv), 0)

export function calculateSpendByPeriod(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): number {
  const monthly = totalMonthly(subs, makeConverter(rates, targetCurrency))
  if (period === 'weekly') return (monthly * 12) / 52
  if (period === 'yearly') return monthly * 12
  return monthly
}

/** Buckets for the trend: 7 days / last 6 months / last 12 months. */
function buckets(period: Period): { label: string; start: Date; end: Date }[] {
  const now = new Date()
  if (period === 'weekly') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(now, 6 - i)
      return { label: format(d, 'EEE'), start: startOfDay(d), end: endOfDay(d) }
    })
  }
  const n = period === 'yearly' ? 12 : 6
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(now, n - 1 - i)
    return { label: format(d, 'MMM'), start: startOfMonth(d), end: endOfMonth(d) }
  })
}

export function getSpendTrend(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): TrendPoint[] {
  const conv = makeConverter(rates, targetCurrency)
  const list = active(subs)
  return buckets(period).map(({ label, start, end }) => ({
    label,
    value: list.reduce((sum, s) => sum + occurrencesInRange(s, start, end) * conv(s.price, s.currency), 0),
  }))
}

export function getCategoryBreakdown(subs: Subscription[], targetCurrency: string, rates: Rates): CategorySlice[] {
  const conv = makeConverter(rates, targetCurrency)
  const totals = new Map<string, number>()
  for (const s of active(subs)) {
    const amt = monthlyEquivalent(s, conv)
    if (amt <= 0) continue
    totals.set(categoryOf(s), (totals.get(categoryOf(s)) ?? 0) + amt)
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0) || 1
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount, percentage: (amount / grand) * 100, color: categoryColor(category) }))
    .sort((a, b) => b.amount - a.amount)
}

export function getTopSpenders(subs: Subscription[], targetCurrency: string, rates: Rates, limit = 3): Subscription[] {
  const conv = makeConverter(rates, targetCurrency)
  return active(subs)
    .filter((s) => monthlyEquivalent(s, conv) > 0)
    .sort((a, b) => monthlyEquivalent(b, conv) - monthlyEquivalent(a, conv))
    .slice(0, limit)
}

export function getInsights(subs: Subscription[], targetCurrency: string, rates: Rates): Insights {
  const conv = makeConverter(rates, targetCurrency)
  const breakdown = getCategoryBreakdown(subs, targetCurrency, rates)
  const trend = getSpendTrend(subs, 'yearly', targetCurrency, rates)
  const cheapest = trend.length ? trend.reduce((min, p) => (p.value < min.value ? p : min)) : null
  return {
    mostExpensiveCategory: breakdown[0]?.category ?? '—',
    yearlyProjection: totalMonthly(subs, conv) * 12,
    cheapestMonth: cheapest?.label ?? '—',
    mostExpensiveSub: getTopSpenders(subs, targetCurrency, rates, 1)[0]?.name ?? '—',
  }
}

/** Monthly-equivalent cost of one sub, for display in Top Spenders. */
export function monthlyCost(sub: Subscription, targetCurrency: string, rates: Rates): number {
  return monthlyEquivalent(sub, makeConverter(rates, targetCurrency))
}
