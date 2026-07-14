/**
 * Live exchange rates from Frankfurter (frankfurter.dev) — free, no API key,
 * ECB daily reference rates. Base is EUR; the base itself is omitted from the
 * response, so we inject EUR: 1 for convenience.
 */
export interface RatesResult {
  date: string
  rates: Record<string, number>
}

export async function fetchRates(): Promise<RatesResult> {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR')
  if (!res.ok) throw new Error(`Rates request failed: ${res.status}`)
  const json = (await res.json()) as { date: string; rates: Record<string, number> }
  return { date: json.date, rates: { EUR: 1, ...json.rates } }
}
