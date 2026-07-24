import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import type { SubscriptionItem } from '@/components/home/SubscriptionRow'
import { POPULAR_SERVICES } from '@/constants/services'
import { formatCurrency } from '@/utils/currency'
import { getBrandVisual } from '@/utils/brand'
import { nextRenewalIso } from '@/utils/renewalDates'

export interface UpcomingItem {
  id: string
  name: string
  daysLabel: string
  price: string
  color: string
  brandKey: string | null
}

const PERIOD_LABEL: Record<Subscription['billing_period'], string> = {
  weekly: 'weekly', once: 'once', monthly: 'monthly', yearly: 'yearly',
}

function daysLabel(iso: string): string {
  const days = differenceInCalendarDays(parseISO(iso), new Date())
  if (days <= 0) return 'Today'
  if (days === 1) return '1 Day'
  return `${days} Days`
}

/** Prefer the brand catalog's category (by brand_key), then the stored value. */
function categoryFor(sub: Subscription): string {
  const catalog = POPULAR_SERVICES.find((s) => s.brandKey === sub.brand_key)
  return catalog?.category ?? sub.category ?? '—'
}

export function toRowItem(sub: Subscription): SubscriptionItem {
  const { color } = getBrandVisual(sub.brand_key, sub.name, sub.color)
  return {
    id: sub.id,
    name: sub.name,
    category: categoryFor(sub),
    price: formatCurrency(sub.price, sub.currency),
    period: PERIOD_LABEL[sub.billing_period],
    color,
    brandKey: sub.brand_key,
  }
}

export function toUpcomingItem(sub: Subscription): UpcomingItem {
  const { color } = getBrandVisual(sub.brand_key, sub.name, sub.color)
  const nextIso = nextRenewalIso(sub)
  return {
    id: sub.id,
    name: sub.name,
    daysLabel: nextIso ? daysLabel(nextIso) : '',
    price: formatCurrency(sub.price, sub.currency),
    color,
    brandKey: sub.brand_key,
  }
}
