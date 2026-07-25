import { endOfDay, format, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { occurrencesInRange } from '@/utils/charges'

/**
 * Actual amount paid so far = every charge from the start date up to today ×
 * price (the first charge on the start date included). Uses the shared
 * occurrence counter so Home, Subscription Details, and Analytics agree.
 */
export function computeTotalPaid(sub: Subscription): number {
  return occurrencesInRange(sub, new Date(0), endOfDay(new Date())) * sub.price
}

/** Format an ISO date string as "Jun 24, 2025". */
export function formatLongDate(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'MMM d, yyyy')
}
