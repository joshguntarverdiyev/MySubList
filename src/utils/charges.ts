import { addMonths, addWeeks, addYears, isAfter, isBefore, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'

const OCC_CAP = 3000

/**
 * Count of charge occurrences for a sub within [start, end], inclusive. Counts
 * the first charge (on the start date) plus every renewal since — free trials
 * bill from trial_end_date. Shared by analytics (spend) and total-paid so they
 * count identically. Callers filter by is_active as needed.
 */
export function occurrencesInRange(sub: Subscription, start: Date, end: Date): number {
  const from = sub.is_free_trial && sub.trial_end_date ? parseISO(sub.trial_end_date) : parseISO(sub.start_date)
  if (sub.billing_period === 'once') return !isBefore(from, start) && !isAfter(from, end) ? 1 : 0
  const step = sub.billing_period === 'weekly' ? addWeeks : sub.billing_period === 'yearly' ? addYears : addMonths
  let d = from
  let steps = 0
  while (isBefore(d, start) && steps < OCC_CAP) { d = step(d, 1); steps++ }
  let count = 0
  while (!isAfter(d, end) && steps < OCC_CAP) { count++; d = step(d, 1); steps++ }
  return count
}
