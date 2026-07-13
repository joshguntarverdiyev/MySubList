import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import type { SubscriptionItem } from '@/components/home/SubscriptionRow'
import { formatCurrency } from '@/utils/currency'
import { getBrandVisual } from '@/utils/brand'

export interface UpcomingItem {
  id: string
  name: string
  daysLabel: string
  price: string
  color: string
  initial: string
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

export function toRowItem(sub: Subscription): SubscriptionItem {
  const { color, initial } = getBrandVisual(sub.brand_key, sub.name, sub.color)
  return {
    id: sub.id,
    name: sub.name,
    category: sub.category ?? '—',
    price: formatCurrency(sub.price, sub.currency),
    period: PERIOD_LABEL[sub.billing_period],
    color,
    initial,
  }
}

export function toUpcomingItem(sub: Subscription): UpcomingItem {
  const { color, initial } = getBrandVisual(sub.brand_key, sub.name, sub.color)
  return {
    id: sub.id,
    name: sub.name,
    daysLabel: sub.next_renewal_date ? daysLabel(sub.next_renewal_date) : '',
    price: formatCurrency(sub.price, sub.currency),
    color,
    initial,
  }
}
