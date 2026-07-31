import { CURRENCIES_LIST } from '@/constants/currencies'

const SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES_LIST.map((c) => [c.code, c.symbol]),
)

/** Symbol for a currency, falling back to the ISO code for anything unknown. */
export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? currency
}

// ISO 4217 currencies with no minor unit — showing decimals on these is wrong
// (e.g. "¥1200", not "¥1200.00").
const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY', 'KRW', 'VND', 'CLP', 'ISK', 'XAF', 'XOF', 'XPF',
  'BIF', 'DJF', 'GNF', 'KMF', 'PYG', 'RWF', 'UGX', 'VUV',
])

/** Decimal places to show for a currency (0 for zero-decimal currencies). */
function decimalsFor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2
}

/** Format an amount with its currency symbol, e.g. "€6.99" / "¥1200". */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbol(currency)
  return `${symbol}${amount.toFixed(decimalsFor(currency))}`
}
