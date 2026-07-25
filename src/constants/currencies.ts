export interface CurrencyDef {
  code: string
  symbol: string
  name: string
}

/**
 * Single source of truth for supported currencies. All are backed by the
 * Frankfurter/ECB rate feed (src/lib/exchangeRates.ts) so conversion is
 * accurate. Order: majors first, then regional. Free tier = EUR + USD
 * (see FREE_CURRENCIES); the rest are Pro-gated.
 */
export const CURRENCIES_LIST: CurrencyDef[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
]
