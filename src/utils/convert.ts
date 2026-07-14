/**
 * Currency conversion using EUR-based rates (rate[X] = units of X per 1 EUR).
 * Converts `amount` from one currency to another. If either rate is missing,
 * returns the amount unchanged — a safe 1:1 fallback when rates aren't loaded.
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return amount
  return (amount / fromRate) * toRate
}

export type Converter = (amount: number, from: string) => number

/** Build a converter that maps any amount into `target` using `rates`. */
export function makeConverter(rates: Record<string, number>, target: string): Converter {
  return (amount, from) => convert(amount, from, target, rates)
}
