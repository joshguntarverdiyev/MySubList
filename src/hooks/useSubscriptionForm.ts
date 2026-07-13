import { useState } from 'react'
import { router } from 'expo-router'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { BillingPeriod } from '@/constants/subscriptionOptions'
import { computeNextRenewalDate } from '@/utils/renewal'

interface FormErrors {
  name?: string
  price?: string
  date?: string
}

export function useSubscriptionForm(initialName: string, brandKey?: string) {
  const [name, setName] = useState(initialName)
  const [plan, setPlan] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [method, setMethod] = useState<string | null>(null)
  const [freeTrial, setFreeTrial] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) next.price = 'Enter a valid price'
    if (!startDate) next.date = 'Start date is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    setApiError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setApiError('You must be signed in to add a subscription.')
      setLoading(false)
      return
    }
    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      name: name.trim(),
      plan_name: plan.trim() || null,
      brand_key: brandKey || null,
      price: parseFloat(price),
      currency,
      billing_period: period,
      start_date: format(startDate!, 'yyyy-MM-dd'),
      next_renewal_date: computeNextRenewalDate(startDate!, period),
      payment_method: method,
      is_free_trial: freeTrial,
      is_active: true,
    })
    setLoading(false)
    if (error) {
      setApiError('Could not save subscription. Please try again.')
      return
    }
    // Dismiss the modal stack (new + add) to reveal the existing Home tab underneath,
    // instead of pushing a brand-new Home inside the modal presentation.
    router.dismissAll()
  }

  return {
    name, setName, plan, setPlan, startDate, setStartDate,
    price, setPrice, currency, setCurrency, period, setPeriod,
    method, setMethod, freeTrial, setFreeTrial,
    errors, apiError, loading, submit,
  }
}
