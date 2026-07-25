import type { SheetOption } from '@/components/profile/OptionSheet'
import { CURRENCIES_LIST } from '@/constants/currencies'

export const NOTIFICATION_OPTIONS: SheetOption<number>[] = [
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
]

export const CURRENCY_OPTIONS: SheetOption<string>[] = CURRENCIES_LIST.map((c) => ({
  label: `${c.code} ${c.symbol}`,
  value: c.code,
}))

export const FIRST_DAY_OPTIONS: SheetOption<number>[] = [
  { label: 'Monday', value: 1 },
  { label: 'Sunday', value: 0 },
]

export function notificationLabel(days: number): string {
  return NOTIFICATION_OPTIONS.find((o) => o.value === days)?.label ?? `${days} days before`
}

export function currencyLabel(currency: string): string {
  return CURRENCY_OPTIONS.find((o) => o.value === currency)?.label ?? currency
}

export function firstDayLabel(day: number): string {
  return FIRST_DAY_OPTIONS.find((o) => o.value === day)?.label ?? 'Monday'
}
