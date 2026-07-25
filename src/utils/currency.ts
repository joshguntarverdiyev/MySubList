import { CURRENCIES_LIST } from '@/constants/currencies'

const SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES_LIST.map((c) => [c.code, c.symbol]),
)

/** Symbol for a currency, falling back to the ISO code for anything unknown. */
export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? currency
}

/** Format an amount with its currency symbol, e.g. "€6.99". */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbol(currency)
  return `${symbol}${amount.toFixed(2)}`
}
