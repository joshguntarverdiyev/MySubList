import {
  addMonths, addWeeks, addYears, differenceInCalendarDays,
  endOfMonth, format, isAfter, isBefore, parseISO, startOfDay, startOfMonth,
} from 'date-fns'
import type { Subscription } from '@/types/subscription'

/** Dot categories used for coloring renewal occurrences on the grid. */
export type RenewalKind = 'paid' | 'trial' | 'weekly' | 'monthly' | 'yearly'

export const KIND_COLOR: Record<RenewalKind, string> = {
  paid: '#10B981',
  trial: '#F59E0B',
  weekly: '#EC4899',
  monthly: '#8B5CF6',
  yearly: '#EF4444',
}

// Guard against runaway loops for weekly subs with very old start dates.
const MAX_STEPS = 400

/**
 * All renewal dates for one subscription that fall within the target month.
 * `month` is 0-indexed (0 = January), matching JS Date. Trial end dates are
 * included as their own marked date in addition to the regular schedule.
 */
export function getRenewalDatesForMonth(
  sub: Subscription,
  year: number,
  month: number
): Date[] {
  if (!sub.is_active) return []

  const monthStart = startOfMonth(new Date(year, month, 1))
  const monthEnd = endOfMonth(monthStart)
  const start = parseISO(sub.start_date)
  const dates: Date[] = []

  const within = (d: Date) => !isBefore(d, monthStart) && !isAfter(d, monthEnd)

  if (sub.billing_period === 'once') {
    if (within(start)) dates.push(start)
  } else {
    const step =
      sub.billing_period === 'weekly' ? addWeeks
      : sub.billing_period === 'yearly' ? addYears
      : addMonths
    let d = start
    let steps = 0
    while (!isAfter(d, monthEnd) && steps < MAX_STEPS) {
      if (within(d)) dates.push(d)
      d = step(d, 1)
      steps += 1
    }
  }

  // Trial end date is an independent marked date (orange).
  if (sub.is_free_trial && sub.trial_end_date) {
    const te = parseISO(sub.trial_end_date)
    if (within(te)) dates.push(te)
  }

  return dates
}

/** Map of "yyyy-MM-dd" -> subscriptions renewing on that date this month. */
export function getMonthRenewalMap(
  subs: Subscription[],
  year: number,
  month: number
): Map<string, Subscription[]> {
  const map = new Map<string, Subscription[]>()
  for (const sub of subs) {
    for (const d of getRenewalDatesForMonth(sub, year, month)) {
      const key = format(d, 'yyyy-MM-dd')
      const list = map.get(key)
      if (list) list.push(sub)
      else map.set(key, [sub])
    }
  }
  return map
}

/**
 * Classify a single occurrence into a dot color category.
 * A trial's end date is always orange; a past-dated renewal is "paid" (green);
 * otherwise the color follows the billing period.
 */
export function renewalKind(sub: Subscription, dateKey: string): RenewalKind {
  if (sub.is_free_trial && sub.trial_end_date === dateKey) return 'trial'
  const today = startOfDay(new Date())
  if (isBefore(parseISO(dateKey), today)) return 'paid'
  if (sub.billing_period === 'weekly') return 'weekly'
  if (sub.billing_period === 'yearly') return 'yearly'
  return 'monthly'
}

/** Days-away label for the next payment, e.g. "Today" / "Tomorrow" / "In 5 days". */
export function daysAwayLabel(iso: string): string {
  const days = differenceInCalendarDays(parseISO(iso), new Date())
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}
