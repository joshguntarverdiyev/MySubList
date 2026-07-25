import {
  addMonths, addWeeks, addYears, endOfDay, endOfMonth, format, isAfter, isBefore,
  parseISO, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears,
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

/** A sub's cost normalized to a monthly figure (for projections/ranking). once → 0. */
function monthlyEquivalent(sub: Subscription, conv: Converter): number {
  if (sub.billing_period === 'once') return 0
  const price = conv(sub.price, sub.currency)
  if (sub.billing_period === 'weekly') return price * WEEKS_PER_MONTH
  if (sub.billing_period === 'yearly') return price / 12
  return price
}

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

/** Start of the current period (weeks start Monday). */
function periodStart(period: Period, ref: Date): Date {
  if (period === 'weekly') return startOfWeek(ref, { weekStartsOn: 1 })
  if (period === 'yearly') return startOfYear(ref)
  return startOfMonth(ref)
}

/** Money actually charged in [start, end], converted to the target currency. */
function spendInRange(subs: Subscription[], start: Date, end: Date, conv: Converter): number {
  return active(subs).reduce((sum, s) => sum + occurrencesInRange(s, start, end) * conv(s.price, s.currency), 0)
}

const totalMonthly = (subs: Subscription[], conv: Converter) =>
  active(subs).reduce((sum, s) => sum + monthlyEquivalent(s, conv), 0)

/** Actual spend from the start of the current period up to (and including) today. */
export function calculateSpendByPeriod(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): number {
  const now = new Date()
  return spendInRange(subs, periodStart(period, now), endOfDay(now), makeConverter(rates, targetCurrency))
}

/** % change vs the same to-date window one period earlier (null if no prior spend). */
export function getSpendChange(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): number | null {
  const conv = makeConverter(rates, targetCurrency)
  const now = new Date()
  const start = periodStart(period, now)
  const cur = spendInRange(subs, start, endOfDay(now), conv)
  const shift = period === 'weekly' ? subWeeks : period === 'yearly' ? subYears : subMonths
  const prev = spendInRange(subs, shift(start, 1), endOfDay(shift(now, 1)), conv)
  return prev > 0 ? ((cur - prev) / prev) * 100 : null
}

/** Trend buckets: 7 days / last 6 months / last 12 months, each capped at today. */
function buckets(period: Period): { label: string; start: Date; end: Date }[] {
  const now = new Date()
  const cap = endOfDay(now)
  const clamp = (d: Date) => (isAfter(d, cap) ? cap : d)
  if (period === 'weekly') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(now, 6 - i)
      return { label: format(d, 'EEE'), start: startOfDay(d), end: clamp(endOfDay(d)) }
    })
  }
  const n = period === 'yearly' ? 12 : 6
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(now, n - 1 - i)
    return { label: format(d, 'MMM'), start: startOfMonth(d), end: clamp(endOfMonth(d)) }
  })
}

export function getSpendTrend(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): TrendPoint[] {
  const conv = makeConverter(rates, targetCurrency)
  return buckets(period).map(({ label, start, end }) => ({ label, value: spendInRange(subs, start, end, conv) }))
}

/** Category split of ACTUAL spend over the selected period, to date. */
export function getCategoryBreakdown(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): CategorySlice[] {
  const conv = makeConverter(rates, targetCurrency)
  const now = new Date()
  const start = periodStart(period, now)
  const end = endOfDay(now)
  const totals = new Map<string, number>()
  for (const s of active(subs)) {
    const amt = occurrencesInRange(s, start, end) * conv(s.price, s.currency)
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

export function getInsights(subs: Subscription[], period: Period, targetCurrency: string, rates: Rates): Insights {
  const conv = makeConverter(rates, targetCurrency)
  const breakdown = getCategoryBreakdown(subs, period, targetCurrency, rates)
  const trend = getSpendTrend(subs, 'yearly', targetCurrency, rates)
  const cheapest = trend.length ? trend.reduce((min, p) => (p.value < min.value ? p : min)) : null
  return {
    mostExpensiveCategory: breakdown[0]?.category ?? '—',
    yearlyProjection: totalMonthly(subs, conv) * 12,
    cheapestMonth: cheapest?.label ?? '—',
    mostExpensiveSub: getTopSpenders(subs, targetCurrency, rates, 1)[0]?.name ?? '—',
  }
}

export function monthlyCost(sub: Subscription, targetCurrency: string, rates: Rates): number {
  return monthlyEquivalent(sub, makeConverter(rates, targetCurrency))
}
