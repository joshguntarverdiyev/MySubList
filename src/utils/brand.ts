import { POPULAR_SERVICES } from '@/constants/services'
import { LOGOS } from '@/utils/brandLogos'

export interface BrandVisual {
  color: string
  initial: string
  /** require()'d logo image source, or null to fall back to the colored initial. */
  logo: number | null
}

/**
 * Resolve a brand's display visuals from its brand_key / name / stored color.
 * Returns a logo image when one exists, else a colored badge + first letter.
 */
export function getBrandVisual(
  brandKey: string | null,
  name: string,
  color?: string | null,
): BrandVisual {
  const match = POPULAR_SERVICES.find((s) => s.brandKey === brandKey)
  return {
    color: color ?? match?.color ?? '#7C4DFF',
    initial: (match?.initial ?? name.charAt(0) ?? '?').toUpperCase(),
    logo: (brandKey ? LOGOS[brandKey] : undefined) ?? null,
  }
}
