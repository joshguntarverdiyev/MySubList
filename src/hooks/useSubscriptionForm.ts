import { useState } from 'react'
import { router } from 'expo-router'
import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { BillingPeriod } from '@/constants/subscriptionOptions'
import type { Subscription } from '@/types/subscription'
import { initialRenewalDate } from '@/utils/renewal'
import { useSubscriptionStore } from '@/store/subscriptionStore'

interface FormErrors {
  name?: string
  price?: string
  date?: string
}

interface UseSubscriptionFormOptions {
  subscription?: Subscription
  initialName?: string
  initialCurrency?: string
  brandKey?: string
}

export function useSubscriptionForm(options: UseSubscriptionFormOptions = {}) {
  const { subscription, initialName, initialCurrency, brandKey } = options
  const isEdit = !!subscription

  const [name, setName] = useState(subscription?.name ?? initialName ?? '')
  const [plan, setPlan] = useState(subscription?.plan_name ?? '')
  const [startDate, setStartDate] = useState<Date | null>(
    subscription?.start_date ? parseISO(subscription.start_date) : null
  )
  const [price, setPrice] = useState(subscription ? String(subscription.price) : '')
  const [currency, setCurrency] = useState(subscription?.currency ?? initialCurrency ?? 'EUR')
  const [period, setPeriod] = useState<BillingPeriod>(subscription?.billing_period ?? 'monthly')
  const [method, setMethod] = useState<string | null>(subscription?.payment_method ?? null)
  const [freeTrial, setFreeTrial] = useState(subscription?.is_free_trial ?? false)
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
      setApiError(`You must be signed in to ${isEdit ? 'edit' : 'add'} a subscription.`)
      setLoading(false)
      return
    }

    const fields = {
      name: name.trim(),
      plan_name: plan.trim() || null,
      price: parseFloat(price),
      currency,
      billing_period: period,
      start_date: format(startDate!, 'yyyy-MM-dd'),
      next_renewal_date: initialRenewalDate(startDate!, period),
      payment_method: method,
      is_free_trial: freeTrial,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', subscription!.id)
        .eq('user_id', user.id)
      setLoading(false)
      if (error) {
        setApiError('Could not save changes. Please try again.')
        return
      }
      await useSubscriptionStore.getState().refreshSubscriptions(user.id)
      // Replace so the Details screen remounts and reloads with fresh data.
      router.replace(`/subscription/${subscription!.id}` as any)
      return
    }

    const { error } = await supabase.from('subscriptions').insert({
      ...fields,
      user_id: user.id,
      brand_key: brandKey || null,
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
