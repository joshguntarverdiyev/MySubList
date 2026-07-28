import {
  addMonths, addWeeks, addYears, differenceInCalendarDays,
  endOfMonth, format, isAfter, isBefore, parseISO, startOfDay, startOfMonth,
} from 'date-fns'
import type { Subscription } from '@/types/subscription'
import type { BillingPeriod } from '@/constants/subscriptionOptions'

// Loop cap for advancing to the next renewal (weekly ≈ 115 years of steps).
const MAX_ADVANCE = 6000

/**
 * Next renewal date ON OR AFTER today from a start date + billing period (pure).
 * "once" or start >= today returns start as-is; otherwise advances one period at
 * a time until >= startOfDay(today).
 */
export function computeNextRenewalDate(
  startDate: Date | string,
  billingPeriod: BillingPeriod,
  today: Date = new Date()
): Date {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  if (billingPeriod === 'once') return start
  const floor = startOfDay(today)
  if (!isBefore(start, floor)) return start

  const step =
    billingPeriod === 'weekly' ? addWeeks
    : billingPeriod === 'yearly' ? addYears
    : addMonths

  let next = start
  let steps = 0
  while (isBefore(next, floor) && steps < MAX_ADVANCE) {
    next = step(next, 1)
    steps += 1
  }
  return next
}

/**
 * Display/sort helper: the next renewal as an ISO "yyyy-MM-dd" string, or
 * null for one-time subs (which have no recurring renewal).
 */
export function nextRenewalIso(sub: Subscription, today: Date = new Date()): string | null {
  if (sub.billing_period === 'once') return sub.next_renewal_date
  // Free trials bill from trial_end_date, not start_date: during the trial the
  // next payment is the trial end date; after it, billing advances from there.
  const base = sub.is_free_trial && sub.trial_end_date ? sub.trial_end_date : sub.start_date
  return format(computeNextRenewalDate(base, sub.billing_period, today), 'yyyy-MM-dd')
}

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
 * All renewal (charge) dates for one subscription that fall within the target
 * month. `month` is 0-indexed (0 = January), matching JS Date.
 *
 * Free-trial subs are not charged until the trial ends, so their billing
 * schedule starts from trial_end_date (the first charge) rather than
 * start_date. If the trial is cancelled/deleted the sub leaves the active
 * list and contributes nothing.
 */
export function getRenewalDatesForMonth(
  sub: Subscription,
  year: number,
  month: number
): Date[] {
  if (!sub.is_active) return []

  const monthStart = startOfMonth(new Date(year, month, 1))
  const monthEnd = endOfMonth(monthStart)
  const scheduleStart =
    sub.is_free_trial && sub.trial_end_date
      ? parseISO(sub.trial_end_date)
      : parseISO(sub.start_date)
  const dates: Date[] = []

  const within = (d: Date) => !isBefore(d, monthStart) && !isAfter(d, monthEnd)

  if (sub.billing_period === 'once') {
    if (within(scheduleStart)) dates.push(scheduleStart)
  } else {
    const step =
      sub.billing_period === 'weekly' ? addWeeks
      : sub.billing_period === 'yearly' ? addYears
      : addMonths
    let d = scheduleStart
    let steps = 0
    while (!isAfter(d, monthEnd) && steps < MAX_STEPS) {
      if (within(d)) dates.push(d)
      d = step(d, 1)
      steps += 1
    }
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
