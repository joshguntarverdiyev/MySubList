import {
  differenceInWeeks, differenceInMonths,
  differenceInYears, format, parseISO,
} from 'date-fns'
import type { Subscription } from '@/types/subscription'

/**
 * Actual amount paid so far = number of complete billing periods elapsed
 * since the start date × price (minimum one period). One-time = price.
 * Single source of truth for both Home and Subscription Details.
 */
export function computeTotalPaid(sub: Subscription): number {
  const start = parseISO(sub.start_date)
  const now = new Date()
  switch (sub.billing_period) {
    case 'weekly':
      return Math.max(1, differenceInWeeks(now, start)) * sub.price
    case 'monthly':
      return Math.max(1, differenceInMonths(now, start)) * sub.price
    case 'yearly':
      return Math.max(1, differenceInYears(now, start)) * sub.price
    case 'once':
      return sub.price
  }
}

/** Format an ISO date string as "Jun 24, 2025". */
export function formatLongDate(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'MMM d, yyyy')
}
