import { addWeeks, addMonths, addYears, format } from 'date-fns'
import type { BillingPeriod } from '@/constants/subscriptionOptions'

/**
 * The first renewal date to store when a subscription is created:
 * start date + one billing period. Returns an ISO date string (yyyy-MM-dd),
 * or null for one-time ('once') payments. For display, always compute the
 * next renewal on-or-after today via computeNextRenewalDate in renewalDates.ts.
 */
export function initialRenewalDate(
  startDate: Date,
  period: BillingPeriod
): string | null {
  let next: Date
  switch (period) {
    case 'weekly':
      next = addWeeks(startDate, 1)
      break
    case 'monthly':
      next = addMonths(startDate, 1)
      break
    case 'yearly':
      next = addYears(startDate, 1)
      break
    case 'once':
      return null
  }
  return format(next, 'yyyy-MM-dd')
}

/** Format a Date for display in the Started Date field. */
export function formatDisplayDate(date: Date): string {
  return format(date, 'dd MMM yyyy')
}
