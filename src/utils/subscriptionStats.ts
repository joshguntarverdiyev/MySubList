import {
  differenceInCalendarWeeks, differenceInCalendarMonths,
  differenceInCalendarYears, format, parseISO,
} from 'date-fns'
import type { Subscription } from '@/types/subscription'

/**
 * Total amount paid so far = price × number of billing cycles elapsed
 * since the start date (counting the initial payment). One-time = price.
 */
export function computeTotalPaid(sub: Subscription): number {
  const start = parseISO(sub.start_date)
  const now = new Date()
  let cycles: number
  switch (sub.billing_period) {
    case 'weekly':
      cycles = differenceInCalendarWeeks(now, start)
      break
    case 'monthly':
      cycles = differenceInCalendarMonths(now, start)
      break
    case 'yearly':
      cycles = differenceInCalendarYears(now, start)
      break
    case 'once':
      return sub.price
  }
  return sub.price * (Math.max(0, cycles) + 1)
}

/** Format an ISO date string as "Jun 24, 2025". */
export function formatLongDate(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'MMM d, yyyy')
}
