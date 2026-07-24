// Distinct color per subscription category, for the analytics donut + legend.
// Keyed to the real catalog categories (src/constants/services.ts) plus "Other"
// for subs whose category isn't in the catalog.
export const CATEGORY_COLORS: Record<string, string> = {
  Streaming: '#EF4444',
  Music: '#EC4899',
  'Cloud Storage': '#3B82F6',
  Productivity: '#6C47D9',
  AI: '#8B5CF6',
  Design: '#A855F7',
  Development: '#10B981',
  Gaming: '#F97316',
  'News & Reading': '#6B7280',
  Fitness: '#14B8A6',
  Education: '#F59E0B',
  'VPN & Security': '#0EA5E9',
  'Social & Lifestyle': '#F43F5E',
  Other: '#9CA3AF',
}

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other
}
