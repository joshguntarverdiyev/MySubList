import { differenceInCalendarDays, isAfter, parseISO, startOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/types/subscription'
import { computeTotalPaid } from '@/utils/subscriptionStats'
import { nextRenewalIso, getRenewalDatesForMonth } from '@/utils/renewalDates'
import type { Converter } from '@/utils/convert'

/** Default converter: no conversion (1:1), used when rates aren't available. */
const identity: Converter = (amount) => amount

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Subscription[]
}

/** Subscriptions renewing within the next 30 days, soonest first, max 10. */
export function getUpcomingPayments(subscriptions: Subscription[]): Subscription[] {
  const today = new Date()
  return subscriptions
    .map((s) => ({ sub: s, next: nextRenewalIso(s, today) }))
    .filter(({ next }) => {
      if (!next) return false
      const days = differenceInCalendarDays(parseISO(next), today)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => parseISO(a.next!).getTime() - parseISO(b.next!).getTime())
    .slice(0, 10)
    .map(({ sub }) => sub)
}

/** Actual total paid so far across all subscriptions (sum of per-sub paid). */
export function calculateTotalPaid(subscriptions: Subscription[], convert: Converter = identity): number {
  return subscriptions.reduce((sum, s) => sum + convert(computeTotalPaid(s), s.currency), 0)
}

/**
 * Money actually charged so far this month: sum of every renewal (charge)
 * that has landed from the 1st of the current month up to and including today.
 * Grows as new charges hit their date; resets on the 1st of each month.
 */
export function calculateMonthToDateSpend(
  subscriptions: Subscription[],
  convert: Converter = identity,
  today: Date = new Date()
): number {
  const year = today.getFullYear()
  const month = today.getMonth()
  const floor = startOfDay(today)
  return subscriptions.reduce((sum, sub) => {
    const charges = getRenewalDatesForMonth(sub, year, month).filter((d) => !isAfter(d, floor))
    return sum + charges.length * convert(sub.price, sub.currency)
  }, 0)
}

/** Subscriptions on a free trial ending within the next 30 days, soonest first. */
export function getTrialsEndingSoon(subscriptions: Subscription[]): Subscription[] {
  const today = new Date()
  return subscriptions
    .filter((s) => {
      if (!s.is_free_trial || !s.trial_end_date) return false
      const days = differenceInCalendarDays(parseISO(s.trial_end_date), today)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => parseISO(a.trial_end_date!).getTime() - parseISO(b.trial_end_date!).getTime())
}

export interface PotentialSavings {
  amount: number
  trialCount: number
  switchCount: number
}

export function calculatePotentialSavings(subscriptions: Subscription[], convert: Converter = identity): PotentialSavings {
  const trialCount = getTrialsEndingSoon(subscriptions).length
  const monthlySubs = subscriptions.filter((s) => s.billing_period === 'monthly')
  const switchCount = monthlySubs.length
  // Rough estimate: switching monthly -> yearly typically saves ~2 months/year.
  const amount = monthlySubs.reduce((sum, s) => sum + convert(s.price * 2, s.currency), 0)
  return { amount, trialCount, switchCount }
}
