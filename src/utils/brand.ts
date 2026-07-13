import { POPULAR_SERVICES } from '@/constants/services'

export interface BrandVisual {
  color: string
  initial: string
}

// When real PNGs land in assets/brands/, add a static map here:
//   const LOGOS: Record<string, any> = { netflix: require('...netflix.png'), ... }
// and return the source alongside color/initial. require() cannot be dynamic,
// so it must be an explicit key -> require map.

/**
 * Resolve a brand's display visuals from its brand_key / name / stored color.
 * Falls back to a colored circle + first letter when no logo is available.
 */
export function getBrandVisual(
  brandKey: string | null,
  name: string,
  color?: string | null
): BrandVisual {
  const match = POPULAR_SERVICES.find((s) => s.brandKey === brandKey)
  return {
    color: color ?? match?.color ?? '#7C4DFF',
    initial: (match?.initial ?? name.charAt(0) ?? '?').toUpperCase(),
  }
}
