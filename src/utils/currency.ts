const SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  TRY: '₺',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
}

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? ''
}

/** Format an amount with its currency symbol, e.g. "€6.99". */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbol(currency)
  return `${symbol}${amount.toFixed(2)}`
}
