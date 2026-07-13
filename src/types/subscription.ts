import type { BillingPeriod } from '@/constants/subscriptionOptions'

export interface Subscription {
  id: string
  user_id: string
  name: string
  plan_name: string | null
  brand_key: string | null
  category: string | null
  price: number
  currency: string
  billing_period: BillingPeriod
  start_date: string
  next_renewal_date: string | null
  payment_method: string | null
  is_free_trial: boolean
  trial_end_date: string | null
  color: string | null
  notes: string | null
  notification_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
