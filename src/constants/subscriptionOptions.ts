export const CURRENCIES = ['EUR', 'USD', 'GBP', 'TRY', 'CAD', 'AUD', 'JPY'] as const

/** Currencies available on the free tier; the rest are Pro (multi-currency). */
export const FREE_CURRENCIES = ['EUR', 'USD']

/** True when a free user tries to use a Pro-only currency → gate to paywall. */
export function isCurrencyLocked(value: string, isPremium: boolean): boolean {
  return !isPremium && !FREE_CURRENCIES.includes(value)
}

export const PAYMENT_METHODS = [
  'Visa',
  'Mastercard',
  'American Express',
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Bank Transfer',
  'Other',
] as const

export type BillingPeriod = 'weekly' | 'once' | 'monthly' | 'yearly'

export const BILLING_PERIODS: { label: string; value: BillingPeriod }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Once', value: 'once' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]
