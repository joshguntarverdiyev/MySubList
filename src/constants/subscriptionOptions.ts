export const CURRENCIES = ['EUR', 'USD', 'GBP', 'TRY', 'CAD', 'AUD', 'JPY'] as const

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
